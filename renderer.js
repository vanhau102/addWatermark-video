
const logoImage = document.getElementById('logoImage');

const destinationBtn = document.getElementById('destination');
const destinationPathElement = document.getElementById('destinationPath');



var logoType = '';


//Chọn kiểu logo
const typeImage = document.querySelector(".typeImage");
const typeText = document.querySelector(".typeText");
typeText.style.display = 'none';
document.getElementById("typeImageLogo").addEventListener('click', () => {
    typeImage.style.display = 'block';
    typeText.style.display = 'none';
});
document.getElementById("typeTextLogo").addEventListener('click', () => {
    typeImage.style.display = 'none';
    typeText.style.display = 'block';
});



const loading = document.querySelector(".loading");
loading.style.display = "none";




destinationBtn.addEventListener('click', async () => {
    const destinationPath = await window.versions.openDirectory();
    destinationPathElement.innerText = destinationPath;
});




const handleAddLogo = async (event) => {
    event.preventDefault();
    document.querySelector(".loading").style.display = 'block';

    const logoType = document.querySelector("input[name='logoType']:checked").id

    console.log(logoType);

    let inputVideo = [];
    Array.from(document.getElementById('inputVideo').files).forEach((file) => {
        inputVideo.push(file.path.replaceAll(' ', '%20'));
    });
    console.log(inputVideo)

    const location = document.querySelector('input[name="location"]:checked').id;

    let logo;

    if (logoType == "typeImageLogo") {
        logo = logoImage.files[0].path;
    } else {
        logo = document.getElementById('logoText').value;
    }

    const fontSize = document.querySelector('#logoFont')?.value;
    const textColor = document.querySelector('#logoColor')?.value;

    console.log(fontSize, textColor);

    const logoWidth = document.querySelector('#logoWidth').value;
    const logoHeight = document.querySelector('#logoHeight').value;

    const destination = document
        .querySelector('#destinationPath')
        .innerText.replaceAll('\\', '\\');

    const addWatermarkSuccessfully = await window.versions.addLogoToVideo({
        inputVideo,
        logoType,
        logo,
        fontSize,
        textColor,
        logoWidth,
        logoHeight,
        location,
        destination,
    });
};


const btnAddLogo = document.getElementById('btnAddLogo');
btnAddLogo.addEventListener('click', handleAddLogo);
