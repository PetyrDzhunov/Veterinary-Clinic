const htmlSelectors = {
    'subHeader': () => document.getElementById('sub-header'),
    'patientsInfoDiv': () => document.querySelector('.patients-info'),
    'contactsInfoDiv': () => document.querySelector('.contacts-container'),
    'phoneParagraph': () => document.getElementById('doctor-phone'),
    'emailParagraph': () => document.getElementById('doctor-email'),
    'contactsButton': () => document.querySelector('.button-contacts'),
    'contactsDiv': () => document.querySelector('.div-contacts'),
    'patientsList': () => document.querySelector('#patients-list'),
    'showPatientsButton': () => document.querySelector('#show-patients-button'),
    'addPatientButton': () => document.getElementById('add-patient-button'),
    'patientNameElement': () => document.getElementById('patientName'),
    'patientAgeElement': () => document.getElementById('patientAge'),
    'clinicalSymptomsElement': () => document.getElementById('clinicalSymptoms'),
    'errorContainer': () => document.getElementById('error-container'),
    'patientsContainer': () => document.querySelector('table > tbody'),
    'editPatientName': () => document.getElementById('edit-patientName'),
    'editPatientAge': () => document.getElementById('edit-patientAge'),
    'editPatientSymptoms': () => document.getElementById('edit-clinicalSymptoms'),
    'editPatientButton': () => document.getElementById('edit-patient-button'),
    'editPatientContainer': () => document.querySelector('.edit-patient-container'),
    'editForm': () => document.querySelector('.edit-form')
};



const baseUrl = `https://veterinary-clinic-74905-default-rtdb.europe-west1.firebasedatabase.app/`;

function createDOMElement(type, text, attributes, events, ...children) {
    const domElement = document.createElement(type);

    if (text !== '') {
        domElement.textContent = text
    }

    Object.entries(attributes).forEach(([attrKey, attrValue]) => {
        domElement.setAttribute(attrKey, attrValue);
    });

    Object.entries(events).forEach(([eventName, eventHandler]) => {
        domElement.addEventListener(eventName, eventHandler);
    })

    children.forEach((child) => domElement.appendChild(child));
    return domElement
}
//eventListeners
htmlSelectors['showPatientsButton']().addEventListener('click', fetchAllPatients);
htmlSelectors['addPatientButton']().addEventListener('click', addPatient)
htmlSelectors['editPatientButton']().addEventListener('click', editPatient)

function addPatient(e) {
    e.preventDefault();
    const patientNameElement = htmlSelectors['patientNameElement']();
    const patientAgeElement = htmlSelectors['patientAgeElement']();
    const clinicalSymptomsElement = htmlSelectors['clinicalSymptomsElement']();
    let initObj = {
        method: "POST",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify({
            name: patientNameElement.value,
            age: patientAgeElement.value,
            clinicalSymptoms: clinicalSymptomsElement.value
        })
    };

    clicked = false
    fetch(`${baseUrl}doctors/patients/.json`, initObj)
        .then(fetchAllPatients)
        .catch(handleError)
    patientNameElement.value = '';
    patientAgeElement.value = '';
    clinicalSymptomsElement.value = '';

}




let clicked = false;

function renderPatients(patientsData) {
    let index = 1;
    const patientsContainer = htmlSelectors['patientsContainer']();
    const showPatientsButton = htmlSelectors['showPatientsButton']();
    if (patientsContainer.innerHTML !== '') {
        patientsContainer.innerHTML = '';
    }

    if (!clicked) {
        Object.entries(patientsData).forEach(([key, patient]) => {
            const tableRow = createDOMElement(
                'tr',
                '', {}, {},
                createDOMElement('td', index++, {}, {}, ),
                createDOMElement('td', patient.name, {}, {}, ),
                createDOMElement('td', patient.age, {}, {}, ),
                createDOMElement('td', Array.isArray(patient.clinicalSymptoms) ? patient.clinicalSymptoms.join(', ') : Array.from(patient.clinicalSymptoms).join(''), {}, {}, ),
                createDOMElement('td', '', {}, {},
                    createDOMElement('button', 'Edit', { 'data-key': key }, { click: loadEditPatientForm }),
                    createDOMElement('button', 'Delete', { 'data-key': key }, { click: deletePatient })
                )
            )
            patientsContainer.appendChild(tableRow)
        })
        showPatientsButton.textContent = 'Hide Patients'
        clicked = true;
    } else {
        showPatientsButton.textContent = 'Show Patients'
        clicked = false;
    }

}

function loadEditPatientForm(e) {
    e.preventDefault();
    const id = this.getAttribute('data-key');

    const initObj = {
        method: "PATCH",
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({})
    }
    fetch(`${baseUrl}doctors/patients/${id}/.json`)
        .then(res => res.json())
        .then(({ age, clinicalSymptoms, name }) => {
            console.log(age, clinicalSymptoms, name);
            htmlSelectors['editPatientName']().value = name;
            htmlSelectors['editPatientAge']().value = age;
            clinicalSymptoms = Array.isArray(clinicalSymptoms) ? clinicalSymptoms.join(', ') : Array.from(clinicalSymptoms).join('')
            htmlSelectors['editPatientSymptoms']().value = clinicalSymptoms
            htmlSelectors['editPatientContainer']().style.display = 'block'
            htmlSelectors['editPatientButton']().setAttribute('data-key', id)
        })
        .catch(handleError)
}



function editPatient(e) {
    e.preventDefault();
    const editPatientName = htmlSelectors['editPatientName']();
    const editPatientAge = htmlSelectors['editPatientAge']();
    const editPatientSymptoms = htmlSelectors['editPatientSymptoms']();
    const editPatientContainer = htmlSelectors['editPatientContainer']();
    const editForm = htmlSelectors['editForm']
    if (editPatientName.value !== '' && editPatientAge.value !== '' && editPatientSymptoms.value !== '') {
        const id = this.getAttribute('data-key');
        const initObj = {
            method: "PATCH",
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                name: editPatientName.value,
                age: editPatientAge.value,
                clinicalSymptoms: editPatientSymptoms.value
            })
        }
        editPatientContainer.style.display = 'none';
        clicked = false
        fetch(`${baseUrl}doctors/patients/${id}/.json`, initObj)
            .then(fetchAllPatients)
            .catch(handleError)
    } else {
        const error = { message: '' };
        if (editPatientName.value === '') {
            error.message += 'Patient name could not be empty!'
        }
        if (editPatientAge.value === '') {
            error.message += 'Patient age must not be empty!'
        }
        if (editPatientSymptoms.value === '') {
            error.message += 'Patient symptoms must not be empty!'
        }
        handleError(error)
    }

}

function deletePatient(e) {
    const id = this.getAttribute('data-key');

    let initObj = {
        method: "DELETE",
        headers: {
            'Content-type': 'application/json'
        }
    }
    clicked = false
    fetch(`${baseUrl}doctors/patients/${id}/.json`, initObj)
        .then(fetchAllPatients)
        .catch(handleError)
}

function fetchAllPatients() {
    fetch(`${baseUrl}doctors/patients/.json`)
        .then(res => res.json())
        .then(renderPatients)
        .catch(handleError)
}

function handleError(err) {
    const errorContainer = htmlSelectors['errorContainer']();
    errorContainer.style.display = 'block';
    errorContainer.textContent = err.message;
    setTimeout(() => {
        errorContainer.style.display = 'none'
    }, 5000);
}





























// function getDoctorData() {
//     fetch(`${baseUrl}doctors.json`)
//         .then((res) => res.json())
//         .then((data) => {
//             key = Object.keys(data)[0];
//             dataObject = data[key];
//         });

//     event Listeners
//     contactsButton.addEventListener(
//         'click',
//         showContacts(dataObject.email, dataObject.phoneNumber)
//     );
//     showPatientsButton.addEventListener('click', showPatients);
//     addPatientButton.addEventListener('click', addPatient);

//     function createElement(ele, classes, content) {
//         let element = document.createElement(ele);
//         element.className = classes;
//         element.innerHTML = content;
//         return element;
//     }

//     function resetInputFields(name, age, breed, symptoms) {
//         name.value = '';
//         age.value = '';
//         breed.value = '';
//         symptoms.value = '';
//     }

//     function showContacts(email, phoneNumber) {
//         let clicked = false;
//         if (!clicked) {
//             phoneParagraph.style.display = 'block';
//             phoneParagraph.textContent = phoneNumber;
//             emailParagraph.style.display = 'block';
//             emailParagraph.textContent = email;
//             contactsDiv.style.background = 'red';
//             clicked = true;
//         } else {
//             phoneParagraph.style.display = 'none';
//             emailParagraph.style.display = 'none';
//             contactsDiv.style.display = 'none';
//             clicked = false;
//         }
//     }

//     let clicked = false;

//     function showPatients(e) {
//         if (!clicked) {
//             patientsList.style.display = 'block';
//             Object.entries(dataObject.patients).forEach(([key, { age, breed, clinicalSymptoms, gender, name, possibleDiagnosis }, ]) => {
//                 let liContent = `${name} - ${age} - ${breed} - ${gender} - \n${clinicalSymptoms.join(', ')}`;
//                 let liElement = createElement('li', 'list-group-item', liContent);
//                 patientsList.appendChild(liElement);
//             });
//             clicked = true;
//         } else {

//         }
//     }

//     function addPatient(e) {
//         e.preventDefault();
//         let patient = {
//             name: patientNameElement.value,
//             age: patientAgeElement.value,
//             breed: patientBreedElement.value,
//             symptoms: clinicalSymptomsElement.value,
//         };

//         let liContent = `${patient.name} - ${patient.age} - ${patient.breed} - \n${patient.symptoms}`;
//         let liElement = createElement('li', 'list-group-item', liContent);

//         patientsList.appendChild(liElement);
//         console.log(key);
//         fetch(`${baseUrl}doctors/${key}/patients.json`, {
//                 method: 'POST',
//                 body: JSON.stringify(patient),
//             })
//             .then(showPatients)
//             .catch(handleError)
//         resetInputFields(
//             patientNameElement,
//             patientAgeElement,
//             patientBreedElement,
//             clinicalSymptomsElement
//         );
//     }

//     function handleError(err) {
//         return document.createElement('p').textContent = err.message;
//     }
// }
// function getPatients(e) {
//   console.log(e.target);
// }