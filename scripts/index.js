let imgInput = document.getElementById('imageInput');
let jsonInput = document.getElementById('jsonInput');
let btn = document.getElementById('loadImageBtn');
let btnJson = document.getElementById('loadJsonBtn');
let btnSave = document.getElementById('saveImg');
let previewImage = document.getElementById('previewImage');
let previewImageBox = document.getElementById('previewImageBox');
let imagePlaceholder = document.getElementById('imagePlaceholder');
let texts = [];
let base64String = '';
const boxWidth = 30;

btnSave.addEventListener('click', (e) => {
    e.preventDefault();
    saveImg();
})

btn.addEventListener('click', () => {
    let reader = new FileReader();
    reader.onload = (e) => {
        base64String = reader.result;
        const imageBase64Stringsep = base64String;
        previewImage.src = base64String;
        clearTextBoxes();
        // alert(imageBase64Stringsep);
        // console.log(base64String);
    }
    let file = imgInput.files[0];
    if (file) {
        reader.readAsDataURL(file);
        previewImage.classList.remove('d-none');
        imagePlaceholder.classList.add('d-none');
        // let newImage = new Image();
        // newImage.onload =
        //     function () {
        //         let w = newImage.width;
        //         let h = newImage.height;
        //         previewImage.src = newImage.src;
        //     };
    } else {
        previewImage.src = '';
        alert('No image selected.');
    }
});
previewImage.addEventListener('click', evt => {
    const x = parseFloat(((evt.offsetX / previewImage.width) * 100).toFixed(2));
    const y = parseFloat(((evt.offsetY / previewImage.height) * 100).toFixed(2));
    const box = prompt('Enter text to be displayed');
    const id = Date.now();
    if(box && box !== '') {
        texts.push(
            {
                x: x,
                y: y,
                text: box,
                id: id
            }
        )
        createTextBoxAtLocation(x, y, box, id);
    }
})

function createTextBoxAtLocation(x, y, text, id) {
    const xPx = (x/100) * previewImage.width;
    const yPx = (y/100) * previewImage.height;
    const boxEl = document.createElement('div');
    const textEl = document.createElement('div');
    boxEl.classList.add('textBox');
    boxEl.setAttribute('id', `box-${id}`);
    textEl.classList.add('textBoxPreview');
    textEl.classList.add('d-none');
    textEl.setAttribute('id', `text-${id}`);
    boxEl.style.left = (previewImage.offsetLeft + (xPx - (boxWidth/2))) + 'px';
    boxEl.style.top = (previewImage.offsetTop + (yPx - (boxWidth/2))) + 'px';
    textEl.style.left = (previewImage.offsetLeft + (xPx - (boxWidth/2))) + 'px';
    textEl.style.top = (previewImage.offsetTop + (yPx + (boxWidth/2))) + 'px';
    boxEl.setAttribute('data-text', text);
    textEl.innerText = text;
    boxEl.setAttribute('title', text);
    boxEl.addEventListener('click', evt => {
        const id = evt.target.id.replace('box-', 'text-');
        if(evt.target.classList.contains('open')) {
            evt.target.classList.remove('open');
            document.getElementById(id).classList.add('d-none');
        } else {
            evt.target.classList.add('open');
            document.getElementById(id).classList.remove('d-none');
        }
    })
    previewImageBox.appendChild(boxEl);
    previewImageBox.appendChild(textEl);
}
function clearTextBoxes() {
    texts = [];
    const textBoxes = document.querySelectorAll('.textBox, .textBoxPreview');
    textBoxes.forEach(el => {
        el.remove();
    })
}
function saveImg() {
    if(base64String === '') {
        return;
    }
    const fileName = prompt('Name for file to save?');
    if(!fileName) return;
    const saveObj = {
        img: base64String,
        texts: texts
    }
    const file = new File([JSON.stringify(saveObj)], `${fileName}.json`, {type: 'application/json'});
    var url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = URL.createObjectURL(file);
    link.download = `${fileName}.json`;
    link.click();
    URL.revokeObjectURL(url); // This seems to work here.
}

// HANDLE JSON
btnJson.addEventListener('click', async () => {
    clearTextBoxes();
    let file = jsonInput.files[0];
    const object = await parseJsonFile(file);
    if(object.img) {
        previewImage.src = base64String = object.img;
        previewImage.classList.remove('d-none');
        imagePlaceholder.classList.add('d-none');
        texts = object.texts;
        setTimeout(() => {
            for(let i in object.texts) {
                const text = object.texts[i];
                createTextBoxAtLocation(text.x, text.y, text.text, text.id);
            }
        }, 1000);
    }
});
async function parseJsonFile(file) {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader()
        fileReader.onload = event => resolve(JSON.parse(fileReader.result))
        fileReader.onerror = error => reject(error)
        fileReader.readAsText(file)
    })
}
