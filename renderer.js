// const information = document.getElementById('info')
// information.innerText = `This app is using Chrome (v${versions.chrome()}), Node.js (v${versions.node()}), and Electron (v${versions.electron()})`


const logoImage = document.getElementById('logoImage');


const destinationBtn = document.getElementById('destination');
const destinationPathElement = document.getElementById('destinationPath');


document.querySelector(".loading").style.display = "none";


destinationBtn.addEventListener('click', async () => {
    const destinationPath = await window.versions.openDirectory();
    destinationPathElement.innerText = destinationPath;
});




const handleAddLogo = async (event) => {
    event.preventDefault();
    document.querySelector(".loading").style.display = 'block';

    let inputVideo = [];
    Array.from(document.getElementById('inputVideo').files).forEach((file) => {
        inputVideo.push(file.path);
    });
    console.log(inputVideo)

    const location = document.querySelector('input[name="location"]:checked').id;

    const logo = logoImage.files[0].path

    const destination = document
        .querySelector('#destinationPath')
        .innerText.replaceAll('\\', '\\');

    const addWatermarkSuccessfully = await window.versions.addLogoToVideo({
        inputVideo,
        logo,
        location,
        destination,
    });
    const h = func()
    if (h == 90) {
        document.querySelector(".loading").style.display = "none";

    }


};

const func = async () => {
    const res = await window.versions.getPathToFfmpeg()
    console.log(res)

    const check = await window.versions.checkProgress();
    return check
}






const btnAddLogo = document.getElementById('btnAddLogo');
btnAddLogo.addEventListener('click', handleAddLogo);
