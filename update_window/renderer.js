const { ipcRenderer } = require("electron");
const acceptBtn = document.getElementById('accept-btn');
const abortBtn = document.getElementById('abort-btn');
const progressBar = document.getElementById('progress-outer');
const progressValue = document.getElementById('progress-value');
const downloadedMsg = document.getElementById('downloaded-msg');

progressBar.style.display = 'none';
downloadedMsg.style.visibility = 'hidden';

ipcRenderer.once('updater::patchnotes', (event, data) => {
    document.getElementById('dynamic-container').innerHTML = `<h4>Version: ${data.version}</h4>${data.releaseNotes}`;
    acceptBtn.addEventListener('click', startDownload);
});

ipcRenderer.on('updater::downloadprogress', (event, data) => {
    progressValue.style.width = `${Math.round(data.percent)}%`;
});

ipcRenderer.on('updater::downloadcomplete', () => {
    onDownloadComplete();
});

ipcRenderer.on('updater::error', () => {

})

function startDownload() {
    ipcRenderer.send('updateui::startdownload');
    acceptBtn.style.display = 'none';
    abortBtn.style.display = 'none';
    progressBar.style.display = 'block';
}

function startInstallation() {
    ipcRenderer.send('updateui::startinstallation');
}

function abort() {
    ipcRenderer.send('updateui::abort');
}

function onDownloadComplete() {
    acceptBtn.removeEventListener('click', startDownload);
    acceptBtn.addEventListener('click', startInstallation);
    downloadedMsg.style.visibility = 'visible';
    progressBar.style.display = 'none';
    downloadedMsg.style.display = 'block';
    acceptBtn.innerText = "Install now";
    acceptBtn.style.display = 'inline-block';
    abortBtn.style.display = 'inline-block';
}