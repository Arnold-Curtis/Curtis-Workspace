# Curtis' Professional Portfolio

A modern, interactive portfolio website built with React, featuring an AI assistant powered by Google's Gemini API.

## 🚀 Features

- **Interactive AI Assistant**: Chat with an AI that knows about Curtis's skills and projects
- **Responsive Design**: Optimized for both desktop and mobile devices  
- **Modern UI**: Clean, professional interface with smooth animations
- **Single Page Application**: Fast navigation with React Router

## 🔧 Setup Instructions

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd curtisworkspace
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   ```
   
   Then edit the `.env` file and add your Gemini API key:
   ```
   REACT_APP_GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

### Getting a Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key and add it to your `.env` file

## 🚀 Deployment

### Build for production
```bash
npm run build
```

### Environment Variables for Production
Make sure to set the `REACT_APP_GEMINI_API_KEY` environment variable in your hosting platform:

- **Netlify**: Add it in Site Settings > Environment Variables
- **Vercel**: Add it in Project Settings > Environment Variables  
- **Heroku**: Use `heroku config:set REACT_APP_GEMINI_API_KEY=your_key`

## 🔐 Security

### API Key Protection
- Your Gemini API key is stored in a `.env` file that is excluded from version control
- Never commit your `.env` file to GitHub
- Use `.env.example` as a template for setting up environment variables
- For production deployments, set environment variables through your hosting platform's dashboard

### Environment Variables
This project uses the following environment variables:
- `REACT_APP_GEMINI_API_KEY`: Your Google Gemini API key (required for AI functionality)

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── AiOrb.js        # AI chat assistant
│   ├── TopBar.js       # Navigation bar
│   └── ...
├── pages/              # Page components
├── utils/              # Utility functions
│   └── geminiService.js # AI service integration
└── stylings/           # CSS files
```

## 🛠️ Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

## 📝 Notes
