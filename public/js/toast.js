export function showToast(msz, type) {
	var snackbar = document.getElementById("snackbar");
	snackbar.className = "show";
	snackbar.className = type;
	snackbar.innerHTML = "";
	snackbar.innerHTML = msz;
	setTimeout(function () { snackbar.className = snackbar.className.replace(type, ""); }, 3000);
}