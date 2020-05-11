window.onload = displayPoints

function displayPoints() {
    document.getElementsByClassName("ZPoints")[0].getElementsByTagName("span")[0].innerHTML = localStorage.getItem('zPoints');
}