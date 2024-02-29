## Project Setup

### Environment Variables

1. Create a `.env` file to set the required environment variables for the project.
2. Add the following variables to the `.env` file:

    ```
    PORT=6062
    WSPORT=6063
    JWT_SECRET_KEY=your_jwt_secret_key
    MAIL_AUTH_EMAIL=your_email@example.com
    MAIL_AUTH_WORD=your_email_password
    MAIL_OAUTH_CLIENTID=your_oauth_client_id
    MAIL_OAUTH_CLIENT_SECRET=your_oauth_client_secret
    MAIL_OAUTH_REFRESH_TOKEN=your_oauth_refresh_token
    MAIL_DEFAULT_FROM=default_sender_email@example.com
    MAIL_DEFAULT_TO=default_receiver_email@example.com
    ```

### Running the Server

1. Open Command Prompt, Git Bash, or any other terminal.
2. Navigate to the project directory:

    ```
    cd chatterhost
    ```
3. Install dependencies:

    ```
    npm install
    ```
4. Start the server:

    ```
    node ./server.js
    ```

### Hosting Media Files

- **Note:** Cloud DB is not configured. To access media files uploaded, such as profile pictures, host the local `./uploads` folder:

    ```
    cd chatterhost/uploads
    http-server --port 6065
    ```

    This command hosts the `uploads` folder to serve media files.

**Note:** If `http-server` is not installed or shows an error like "command not found", please install `http-server` using the following command:


```
npm install -g http-server
```

### Technologies Used:

- Backend: Node.js, Express.js
- Real-Time Communication: WebSocket
- Database: MongoDB
- Version Control: Git

### Acknowledgements:
We would like to thank [Samarth Jain](https://www.linkedin.com/in/samarthjain0) for their contributions and support in developing Chatterbox.

### Referenced Documentations

- [Nodemailer setup](https://dev.to/jlong4223/how-to-implement-email-functionality-with-node-js-react-js-nodemailer-and-oauth2-2h7m)
- [OAuth Playground](https://developers.google.com/oauthplayground)
