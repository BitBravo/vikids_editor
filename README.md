# Vikids Editor
This is an advanced Medium Editor with many additional features.

## Main features

- User authentication
- Text Edit tool
  - New Line
  - Bold, italic, underlined.
- Paste from buffer as plain text
- Drag and Drop
- Special Code Patterns
- Custom Emoji
....

## How to install Dependencies
####  - Install Node.js
##### Windows
- [Please download NodeJS here](https://stackoverflow.com/questions/11944932/how-to-download-a-file-with-node-js-without-using-third-party-libraries "Please download NodeJS here")

#####  MAC
 - [Please download NodeJS for mac here](https://nodejs.org/dist/v10.15.1/node-v10.15.1.pkg "Please download NodeJS for mac here")

- NodeJS Install using Homebrew
 - Install Homebrew using Mac Terminal
```
$  /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)
```
 - Install NodeJS
```
$  brew  install node
```

#### - Install NPM packages

```
$  cd  vikids_editor
$  npm  install
```

## How to bundle Javascript library and CSS file
```
$  cd  vikids_editor
$  grunt  js
$  grunt  css
```

## How to use in your web application
1. Link css font file
2. Link CSS min file in your application
3. Import javascript min file
4. Define the class name of the container element as 'editable'
5. Setting configuration
 - UploadURL endpoint
    var  uploadURL = 'Your uploadURL endpoint';
	Default value is http://localhost:3000/upload

 - DeleteURL endpoint
 	var deleteURL = 'Your uploadURL endpoint';
 	Default value is http://localhost:3000/delete
 
 - User permission
   1. admin_permission value
      You can set the admin permission using admin_permission.
			if current user is admin:  
				var admin_permission  = true;
  2. User permission setting by adding 'give-me-editor' in the contailer's class name.
	`<div class="editable give-me-editor"> 
		Your text here
	</div>
	`

## Sample Code
```
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Custom Editor</title>
    <link rel="stylesheet" href="https://netdna.bootstrapcdn.com/font-awesome/4.1.0/css/font-awesome.css">
    <link rel="stylesheet" href="./dist/css/vikids-editor.css">
</head>
<body>
    <div id="container">
		 // Set the class name of container as 'editable',
        <div class="editable give-me-editor" data-placeholder="Type some text">
            <h2 class="test">Advanced Medium Editor</h2>
        </div>
    </div>

	// Import JQUERY
    <script src="./assests/js/lib/jquery.min.js"></script>

	// USER Configuration
    <script>
        var admin_permission = true;
        var uploadURL = 'http://localhost:9999/uploadurl', 
			deleteURL= 'http://localhost:9999/uploadurl';
    </script>

	// Import the js min file
    <script src="./dist/js/vikids-editor.min.js"></script>
</body>
</html>

```

## How to use this library functions
1. Text Editor
User can edit all text using tooltip toolbar.
- New  Line
- Bold, italic, underlined.
- Align Left, Align Center, Align Right
- Header Text (h1, h2, h3, h4, h5, h6)

    ![Tooltip Toolbar](./assests/img/tooltip-text.gif)

2. Embed Media files
User can embed their media files(Video, Music, Photo, Youtube, Vimemo)
There are three method to embed the media files in your content.
- Drag and Drap

    Ex: Image, Video insert by drag and drop

  ![Drag and Drop](./assests/img/dragdrop.gif)

- Special Code Pattern
	User can generate all html contents by using special pattern.
	Live URL: https://medium-editor-3379b.firebaseapp.com
	Pattern:
    ``` 
	[![image caption](image_url)]
    [@[video caption](video url)]
	```
	
	Example:

     `[![Houses](http://sfeizigroup.com/wp-content/uploads/2017/05/slide-5.jpg)]`

	`[!Houses](http://sfeizigroup.com/wp-content/uploads/2017/05/slide-5.jpg)]`
   
   ![Houses](http://sfeizigroup.com/wp-content/uploads/2017/05/slide-5.jpg)

        - Image insert by code pattern

    ![Code Pattern for Photo](./assests/img/patternimage.gif)

        - Video insert by code pattern

    ![Code Pattern for Video](./assests/img/videopattern.gif)

- Empty New line

    - Image insert by New line

        ![Code Pattern for Video](./assests/img/photoline.gif)

    - Image insert by code pattern

        ![Code Pattern for Video](./assests/img/videoline.gif)