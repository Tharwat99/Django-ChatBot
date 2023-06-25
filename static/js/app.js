class Chatbox {
  constructor() {
      this.args = {
          openButton: document.querySelector('.chatbox__button'),
          chatBox: document.querySelector('.chatbox__support'),
          sendButton: document.querySelector('.send__button'),
          body : document.querySelector('body')
      }
      this.counter = 0;
      this.state = false;
      this.messages = [];
      this.first_line = true
      this.respone_div = null
      this.feedbackForm = document.querySelector('.feedback-form')
      this.cancelFeedbackForm = document.querySelector('.cancel-feedback')
      this.confirmFeedbackForm = document.querySelector('.confirm-feedback')
      this.textFeedbackForm = document.querySelector('.comment-feedback')

  }
  
  typeText(newText, targetElement) {
    // Get the current text content of the target element
    const currentText = targetElement.textContent;
  
    // Check if all text has been typed
    if (this.counter >= newText.length) {
      clearInterval(intervalId);
      console.log('timeout clear child')
      sendButton.disabled = false;
      return;
    }
  
    // Get the next chunk of text to type
    const nextChunk = newText.slice(this.counter, this.counter + 1);
  
    // Update the text content of the target element with the next chunk
    targetElement.textContent = currentText + nextChunk;
  
    // Increment the counter
    this.counter++;
  }
  

  // Create a function to create a new div element with a unique id
  createDivWithUniqueId(chatBox, class_name, message, id = null) {
    
    // Create a new div element
    const newDiv = document.createElement('div');
    // Set class 
    newDiv.setAttribute('class', class_name);  
    // Set the id attribute of the new div element with the unique id
    newDiv.setAttribute('id', id);

    // Set the content of the new div element
    newDiv.innerHTML = message;
    const chatmessage = chatBox.querySelector('.chatbox__messages');
    // Append the new div element to the document body
    chatmessage.insertBefore(newDiv, chatmessage.firstChild);
    this.respone_div = newDiv

  }

  display() {
      const {openButton, chatBox, sendButton, body} = this.args;

      openButton.addEventListener('click', () => this.toggleState(chatBox))

      sendButton.addEventListener('click', () => this.onSendButton(chatBox, sendButton))

      const node = chatBox.querySelector('input');
      node.addEventListener("keyup", ({key}) => {
          if (key === "Enter") {
              this.onSendButton(chatBox, sendButton)
          }
      })
      this.cancelFeedbackForm.addEventListener('click', () => {
        this.feedbackForm.style.display = 'none'
      });
      this.feedbackForm.addEventListener('click', (e) =>{
        e.stopPropagation()
      });
      body.addEventListener('click', () => {
        if (this.feedbackForm.style.display === 'block'){
          this.feedbackForm.style.display = 'none'
        }
      });
      this.confirmFeedbackForm.addEventListener('click', () =>{
        const hiddenInputPrompt = document.getElementById('prompt')
        const hiddenInputlike= document.getElementById('like')
        const hiddenInputDislike= document.getElementById('dislike')
        var prompt = hiddenInputPrompt.value;
        var like = hiddenInputlike.value;
        var dislike = hiddenInputDislike.value;
        var comment = this.textFeedbackForm.value
        const csrfToken = document.querySelector('input[name="csrfmiddlewaretoken"]').value;
        fetch('http://127.0.0.1:8000/chat/remote_feedback_view', {
          method: 'POST',
          body: JSON.stringify({ prompt:+prompt, like, dislike, comment}),
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': csrfToken
            },
        }).then(response => {
          this.feedbackForm.style.display = 'none'
        }).catch((error) => {
          console.error('Error:', error);
          this.sendButton.disabled = false;
        });
        
      });
  }

  toggleState(chatbox) {
      this.state = !this.state;

      // show or hides the box
      if(this.state) {
          chatbox.classList.add('chatbox--active')
      } else {
          chatbox.classList.remove('chatbox--active')
      }
  }

  onSendButton (chatbox, sendButton){
      var textField = chatbox.querySelector('input[type=text]');
      let text1 = textField.value
      if (text1 === "") {
          return;
      }

      //let msg1 = {name: "bot", message: text1 }
      this.messages.push(text1);
      this.updateChatText(chatbox, sendButton, 'bot')
      textField.value = ''
                  
      const csrfToken = document.querySelector('input[name="csrfmiddlewaretoken"]').value;
      // Disable the send button while the request is being processed
      sendButton.disabled = true;
      fetch('http://127.0.0.1:8000/chat/remote_data_view', {
          method: 'POST',
          body: JSON.stringify({ message: text1}),
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': csrfToken
            },
        }).then(response => {
            const reader = response.body.getReader();
            const readStream = () =>{
              reader.read().then(({ done, value }) => {
                if (done) {
                  // Done reading the stream, do something (e.g. close the container)
                  
                  this.messages = []
                  this.first_line == true
                  
                } else {
                  // Continue reading the stream, append the current chunk to the container
                  let text = new TextDecoder().decode(value);
                  
                  if (this.first_line){
                    var text_split;
                    var prompt_id;
                    text_split = text.split('_');
                    prompt_id = text_split[0]
                    text_split.shift()
                    text = text_split.join('_')
                    this.first_line == false
                    this.createDivWithUniqueId(chatbox, 'messages__item messages__item--visitor',  '', prompt_id)
                  }
                  this.messages.push(text);
                  this.updateChatText(chatbox, sendButton, 'user')
                  textField.value = ''
                  readStream();
                }
              });
            }
        
            readStream();
          })
        .catch((error) => {
          console.error('Error:', error);
          textField.value = ''
          sendButton.disabled = false;
        });
  }
  updateChatText(chatbox, sendButton, sender) {
      const newText = this.messages.join(" ");
      if (sender == 'bot'){
        this.createDivWithUniqueId(chatbox, 'messages__item messages__item--operator', newText)
        this.messages = []
      }else{
        this.counter = 0;
        // Call the typing function every 40 milliseconds
        const intervalId = setInterval(() => {
          this.typeText(newText, this.respone_div);
        },50);

        // Clear the interval when all text has been typed
        setTimeout(() => {
          clearInterval(intervalId);
          sendButton.disabled = false
          var likeButton;
          var dislikeButton;
          likeButton = document.createElement('button');
          likeButton.innerHTML = '<i class="far fa-thumbs-up"></i>'
          dislikeButton = document.createElement('button');
          dislikeButton.innerHTML = '<i class="far fa-thumbs-down"></i>'
          this.respone_div.appendChild(likeButton);
          this.respone_div.appendChild(dislikeButton);
          likeButton.addEventListener('click', (e) => {
            e.stopPropagation()
            this.textFeedbackForm.value = ''
            if (this.feedbackForm.style.display = 'none'){
              this.feedbackForm.style.display = 'block'
            }
            // Get ID of the parent element
            const parentId = likeButton.parentNode.getAttribute('id');
            
            // Create hidden input for prompt, like, and dislike and update value
            const hiddenInputPrompt = document.getElementById('prompt')
            const hiddenInputlike= document.getElementById('like')
            const hiddenInputDislike= document.getElementById('dislike')
            hiddenInputPrompt.setAttribute('value', parentId);
            hiddenInputlike.setAttribute('value', true);
            hiddenInputDislike.setAttribute('value', false);
            });
            dislikeButton.addEventListener('click', (e) => 
            {
                e.stopPropagation()
                console.log(this.textFeedbackForm.innerHTML)
                this.textFeedbackForm.value = ''
                console.log(this.textFeedbackForm.innerHTML)
                if (this.feedbackForm.style.display = 'none'){
                  this.feedbackForm.style.display = 'block'
                }
                // Get ID of the parent element
                const parentId = dislikeButton.parentNode.getAttribute('id');
                
                // Create hidden input for prompt, like, and dislike and update value
                const hiddenInputPrompt = document.getElementById('prompt')
                const hiddenInputlike= document.getElementById('like')
                const hiddenInputDislike= document.getElementById('dislike')
                hiddenInputPrompt.setAttribute('value', parentId);
                hiddenInputlike.setAttribute('value', false);
                hiddenInputDislike.setAttribute('value', true);
            });
            sendButton.disabled = false;
          
        }, newText.length * 50);
      }
      
}
}


const chatbox = new Chatbox();
chatbox.display();