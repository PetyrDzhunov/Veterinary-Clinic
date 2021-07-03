// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: 'AIzaSyBmkACNI60u3fkqAVdJjiLLfXPkMqIU9KM',
    authDomain: 'veterinary-clinic-74905.firebaseapp.com',
    projectId: 'veterinary-clinic-74905',
    storageBucket: 'veterinary-clinic-74905.appspot.com',
    messagingSenderId: '898543801482',
    appId: '1:898543801482:web:af0ad4fbe36ea1c1c04973',
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();

const loginButton = document.getElementById('login-button');
loginButton.addEventListener('click', loginFunction);

function loginFunction() {
    const emailElement = document.getElementById('email');
    const passwordElement = document.getElementById('password');
    const subheaderElement = document.getElementById('sub-header');
    const loginDivElement = document.querySelector('.login-div');
    const body = document.querySelector('body');
    let showPatientsButton = document.querySelector('#show-patients-button');

    auth
        .signInWithEmailAndPassword(emailElement.value, passwordElement.value)
        .then((res) => {
            let currentEmail = res.user.email;
            subheaderElement.innerHTML = `Welcome Dr.${currentEmail}`;
            loginDivElement.style.display = 'none';
            const logoutButton = document.createElement('button');
            logoutButton.textContent = 'Logout';
            logoutButton.className = 'btn btn-danger';
            logoutButton.id = 'logout-button';
            //   showPatientsButton.style.display = 'block';
            subheaderElement.appendChild(logoutButton);

            logoutButton.addEventListener('click', (e) => {
                auth.signOut();
                subheaderElement.innerHTML = `Goodbye Dr.${currentEmail}`;
                loginDivElement.style.display = 'block';
                e.target.remove();
            });
        })
        .catch((err) => {
            const errorParagraph = document.createElement('p');
            errorParagraph.className = 'error-paragraph';
            errorParagraph.textContent = err.message + 'Please try again.';
            loginDivElement.appendChild(errorParagraph);
            //   showPatientsButton.style.display = 'none';
            emailElement.value = '';
            passwordElement.value = '';
        });
}