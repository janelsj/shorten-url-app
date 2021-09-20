const API = axios.create({
    baseURL: 'https://url-shortener-service.p.rapidapi.com',
    headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'x-rapidapi-host': 'url-shortener-service.p.rapidapi.com',
        'x-rapidapi-key': '2cc4f9fb5fmsh6c7c17f151bdaa1p1f3fb7jsne9ae56177c97',
    }
});

const dataElement = document.getElementById('data');
const resultElement = document.getElementById('result');

//Different display according to user interaction with browser:
if (!localStorage.length) {
    document.querySelectorAll('fieldset')[1].style.display = "none";
} else if (localStorage.length===1) {
    document.getElementById('reset').style.display = "none";
}

//'enter function' for onkeyup ('enter' key):
function enter(fn, event) {
    if (event.key==="Enter") {
        return fn();
    }
}

//'submit function' - Ensures userInput starts with http & gets API data:
function submit() {
    const urlRegEx = /^http([s]?):\/\/([www.]?)([a-zA-Z0-9-\&\_\%\?\.]+?)$/;
    if(!dataElement.value || !urlRegEx.test(dataElement.value)) {
        alert ('Please input a valid URL.');
        setTimeout(() => {dataElement.focus()}, 1)

    } else {

    //Get data from API:
        async function getResult() {            
            const result = await API.post('/shorten', {url: `${dataElement.value}`}, {
                headers: {
                    "content-security-policy": "default-src * data: 'unsafe-eval' 'unsafe-inline'; worker-src blob:",
                    "content-type": "application/json;charset=utf-8",
                    "referrer-policy": "same-origin",
                    "strict-transport-security": "max-age=31536000; includeSubDomains; preload",
                    "vary": "Accept-Encoding",
                    "x-content-type-options": "nosniff",
                    "x-frame-options": "SAMEORIGIN",
                    "x-xss-protection": "1; mode=block",
                    "content-length": "45",
                    "connection": "Close",
                }
            })
            return result.data.result_url;
        }

    //Store userInput data and API data in localStorage:
        getResult().then(result => {
            const timestamp = new Date().getTime();
            let dataObject = {userInput: dataElement.value, apiData: result};

            //Ensures that "userInput entry + related apiData" pair is not repeated:
            const findResult = Object.keys(localStorage).find(key => {
                return JSON.parse(localStorage.getItem(key)).apiData === result;
            });
            if (!findResult) {
                localStorage.setItem(timestamp, JSON.stringify(dataObject));
            };
            location.reload();
        }).catch(error => console.log(error));
    }
};

//Subsequent DOM manipulation after getting data from API:
Object.keys(localStorage).sort().forEach(key => {
    const data = JSON.parse(localStorage.getItem(key));

    //Create div for userInput data:
    const userInputDiv = document.createElement('div');
    userInputDiv.innerText = `${data.userInput}`;
    userInputDiv.className = "userData";

    //Add URL link:
    const a = document.createElement('a');
    a.href = `${data.apiData}`;
    a.target = "_blank";
    a.innerText = data.apiData;

    //Add icon to copy URL:
    const spanCopy = document.createElement('span');
    spanCopy.tabIndex = 0;
    const copyImg = document.createElement('img');
    copyImg.title = "Copy URL";
    copyImg.src = "./images/copy.png";
    copyImg.width = 30;
    copyImg.addEventListener("mouseover", () => copyImg.style.cursor = "pointer");
    spanCopy.addEventListener('click', copy);
    spanCopy.addEventListener('keyup', event => enter(copy, event));

    function copy() {
        navigator.clipboard.writeText(data.apiData);
        window.alert("Copied URL: " + data.apiData);
    };

    spanCopy.appendChild(copyImg);

    //Add icon to delete userInput and associated API data:
    const spanDelete = document.createElement('span');
    spanDelete.tabIndex = 0;
    const deleteImg = document.createElement('img');
    deleteImg.title = "Delete entry";
    deleteImg.src = "./images/delete.png";
    deleteImg.width = 30;
    deleteImg.addEventListener("mouseover", () => deleteImg.style.cursor = "pointer");
    spanDelete.addEventListener('click', remove);
    spanDelete.addEventListener('keyup', event => enter(remove, event));

    function remove() {
        const divIconsElement = spanDelete.parentNode;
        divIconsElement.parentNode.removeChild(divIconsElement.previousSibling);
        divIconsElement.parentNode.removeChild(divIconsElement.previousSibling);
        divIconsElement.parentNode.removeChild(divIconsElement);
        localStorage.removeItem(key);
        location.reload();
    }

    spanDelete.appendChild(deleteImg);

    //Create div to contain both icons:
    const divIcons = document.createElement('div');
    divIcons.className = "icons";
    divIcons.append(spanCopy,spanDelete);

    //Append all created elements to resultElement:
    resultElement.append(userInputDiv, a, divIcons);
});


//Reset form:
function reset() {
    localStorage.clear();
    location.reload();
}

/* 
References used:
https://blog.logrocket.com/localstorage-javascript-complete-guide/
https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText

Acknowledgements:
delete.png & copy.png from https://www.freepik.com
*/