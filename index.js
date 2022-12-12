
const { app, BrowserWindow, dialog } = require('electron')
const path = require('path')

const Jimp = require("jimp");
const fs = require("fs-extra");
// const pathToFfmpeg = require("ffmpeg-static");
const ffmpeg = require('ffmpeg-static-electron');
const pathToFfmpeg = ffmpeg.path;
const util = require('util');

const exec = util.promisify(require('child_process').exec);


let currentProgress = 0;

const handleDirectoryOpen = async () => {
	const { canceled, filePaths } = await dialog.showOpenDialog({
		properties: ['openFile', 'openDirectory'],
	});
	if (canceled) {
		return '';
	} else {
		return filePaths[0];
	}
};

const addLogoToVideo = async function (data) {
	console.log(data.inputVideo);
	console.log(data.logoType);
	console.log(data.logo);
	console.log(data.destination);
	console.log(data.toUpperCase);

	// Video editor settings
	const videoEncoder = 'h264';

	for (let inputPath of data.inputVideo) {
		console.log(inputPath);
		const outputFile = `output-${Date.now()}.mp4`;
		// const inputFolder = 'temp/raw-frames';
		// const outputFolder = 'temp/edited-frames';
		const inputFolder = `${data.destination}/temp/raw-frames`;
		const outputFolder = `${data.destination}/temp/edited-frames`;

		try {
			// Create temporary folders
			console.log('Initialize temp files');
			// await fs.mkdir('temp');
			await fs.mkdir(`${data.destination}/temp`);
			await fs.mkdir(inputFolder);
			await fs.mkdir(outputFolder);

			// Decode MP4 video and resize it to width 1080 and height auto (to keep the aspect ratio)
			console.log('Decoding');
			await exec(`"${pathToFfmpeg}" -i ${inputPath} -vf scale=1080:-1 ${inputFolder}/%d.png`);

			// Edit each frame
			console.log('Rendering');
			const frames = fs.readdirSync(inputFolder);

			for (let frameCount = 1; frameCount <= frames.length; frameCount++) {

				// Check and log progress
				checkProgress(frameCount, frames.length);

				// Read the current frame
				let frame = await Jimp.read(`${inputFolder}/${frameCount}.png`);

				// Modify frame
				frame = await modifyFrame(frame, data);

				// Save the frame
				await frame.writeAsync(`${outputFolder}/${frameCount}.png`);
			}

			// Encode video from PNG frames to MP4 (no audio)
			console.log('Encoding');
			await exec(`"${pathToFfmpeg}" -start_number 1 -i ${outputFolder}/%d.png -vcodec ${videoEncoder} -pix_fmt yuv420p ${data.destination}/temp/no-audio.mp4`);

			// Copy audio from original video
			console.log('Adding audio');
			await exec(`"${pathToFfmpeg}" -i ${data.destination}/temp/no-audio.mp4 -i ${inputPath} -c copy -map 0:v:0 -map 1:a:0? ${data.destination + '/' + outputFile}`);

			// Remove temp folder
			console.log('Cleaning up');
			await fs.remove(`${data.destination}/temp`);
		} catch (e) {
			console.log("An error occurred:", e);

			// Remove temp folder
			console.log('Cleaning up');
			await fs.remove(`${data.destination}/temp`);
		}
	}
};



// 
//Edit frame
//Add padding to change the aspect ratio to 9:16 (for IGTV)
//Add watermark to frame corner
//@param frame
const modifyFrame = async (frame, data) => {

	switch (data.logoType) {
		case "typeTextLogo": {
			let logoText = data.toUpperCase ? data.logo.toUpperCase() : data.logo;

			const font = await Jimp.loadFont(Jimp[`FONT_SANS_${data.fontSize}_${data.textColor}`]);
			let marginLeft, marginTop;
			switch (data.location) {
				case "topleft":
					marginLeft = 10;
					marginTop = 10;
					break;
				case "topright":
					marginLeft = frame.bitmap.width - 100;
					marginTop = 0;
					break;
				case "bottomleft":
					marginLeft = 0;
					marginTop = frame.bitmap.height - 100;
					break;
				case "bottomright":
					marginLeft = frame.bitmap.width - 100;
					marginTop = frame.bitmap.height - 100;
					break;

			}
			frame.print(font, marginLeft, marginTop, logoText);
			break;
		}
		case "typeImageLogo": {
			let logoImage = await (await Jimp.read(`${data.logo}`))
			if (data.logoWidth > 0 && data.logoHeight > 0) {
				logoImage.resize(logoImage.bitmap.width * data.logoWidth / 100, logoImage.bitmap.height * data.logoHeight / 100);
			}

			let marginLeft, marginTop;
			switch (data.location) {
				case "topleft":
					marginLeft = 0;
					marginTop = 0;
					break;
				case "topright":
					marginLeft = frame.bitmap.width - logoImage.bitmap.width;
					marginTop = 0;
					break;
				case "bottomleft":
					marginLeft = 0;
					marginTop = frame.bitmap.height - logoImage.bitmap.height;
					break;
				case "bottomright":
					marginLeft = frame.bitmap.width - logoImage.bitmap.width;
					marginTop = frame.bitmap.height - logoImage.bitmap.height;
					break;
			}
			//Add watermark to video
			frame.composite(logoImage, marginLeft, marginTop);
		}
	}

	return frame;
};

// /**
//  * Calculate the processing progress based on the current frame number and the total number of frames
//  * @param currentFrame
//  * @param totalFrames
//  */
const checkProgress = (currentFrame, totalFrames) => {
	const progress = currentFrame / totalFrames * 100;
	if (progress > (currentProgress + 10)) {
		const displayProgress = Math.floor(progress);
		console.log(`Progress: ${displayProgress}%`);
		currentProgress = displayProgress;
	}
};


const { ipcMain } = require('electron')
const createWindow = () => {
	const win = new BrowserWindow({
		width: 1000,
		height: 800,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
		},
	})
	ipcMain.handle('dialog:openDirectory', handleDirectoryOpen);
	ipcMain.handle('getPathToFfmpeg', () => pathToFfmpeg)
	ipcMain.handle('addLogoToVideo', (event, data) => {
		addLogoToVideo(data);
	});
	// ipcMain.handle('render', (event, data) => render(data))
	win.loadFile('mainWindow.html')
}


app.whenReady().then(() => {
	createWindow()
})