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

const onlyLettersRegex = /^[A-Za-z ]{3,}$/
const symptomsRegex = /([A-Za-z ,.]{3,})/
const baseUrl = `https://veterinary-clinic-74905-default-rtdb.europe-west1.firebasedatabase.app/`;

function createDOMElement(type, text, attributes, events, ...children) {
    const domElement = document.createElement(type);

    if (text !== '') {
        domElement.textContent = text
    };

    Object.entries(attributes).forEach(([attrKey, attrValue]) => {
        domElement.setAttribute(attrKey, attrValue);
    });

    Object.entries(events).forEach(([eventName, eventHandler]) => {
        domElement.addEventListener(eventName, eventHandler);
    })

    children.forEach((child) => domElement.appendChild(child));
    return domElement;
}

htmlSelectors['showPatientsButton']().addEventListener('click', getAllPatientsHandler);
htmlSelectors['addPatientButton']().addEventListener('click', addPatientHandler)
htmlSelectors['editPatientButton']().addEventListener('click', editPatientHandler)
let clicked = false;

async function addPatientHandler(e) {
    e.preventDefault();
    const patientNameElement = htmlSelectors['patientNameElement']();
    const patientAgeElement = htmlSelectors['patientAgeElement']();
    const clinicalSymptomsElement = htmlSelectors['clinicalSymptomsElement']();
    const patient = { name: patientNameElement.value, age: patientAgeElement.value, clinicalSymptoms: formatString(clinicalSymptomsElement.value) };
    const validateResult = validatePatient(patient);
    if (validateResult.isErrorPresent) {
        handleError(validateResult.message)
    } else {
        await addPatient(patient);
        clicked = false;
        const patients = await getAllPatients();
        renderPatients(patients)
    }
    clearInputFields(patientNameElement, patientAgeElement, clinicalSymptomsElement);
};

function formatString(string) {
    return string.split('/[, ]+/').join(', ')
};

async function addPatient(patient) {
    let initObj = {
        method: "POST",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify({
            name: patient.name,
            age: patient.age,
            clinicalSymptoms: patient.clinicalSymptoms,
        })
    };
    await fetch(`${baseUrl}doctors/patients/.json`, initObj)
};

function renderPatients(patientsData) {
    let index = 1;
    const patientsContainer = htmlSelectors['patientsContainer']();
    const showPatientsButton = htmlSelectors['showPatientsButton']();
    if (patientsContainer.innerHTML !== '') {
        patientsContainer.innerHTML = '';
    }
    if (patientsData == null || patientsData == []) {
        return;
    }

    if (!clicked) {
        Object.entries(patientsData).forEach(([key, patient]) => {
            const tableRow = createDOMElement(
                'tr',
                '', {}, {},
                createDOMElement('td', index++, {}, {}, ),
                createDOMElement('td', patient.name, {}, {}, ),
                createDOMElement('td', patient.age, {}, {}, ),
                createDOMElement('td', patient.clinicalSymptoms, {}, {}, ),
                createDOMElement('td', '', {}, {},
                    createDOMElement('button', 'Edit', { 'data-key': key }, { click: loadEditPatientForm }),
                    createDOMElement('button', 'Delete', { 'data-key': key }, { click: deletePatientHandler })
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
};

async function loadEditPatientForm() {
    const id = this.getAttribute('data-key');
    const patient = await getPatient(id);
    htmlSelectors['editPatientName']().value = patient.name;
    htmlSelectors['editPatientAge']().value = patient.age;
    htmlSelectors['editPatientSymptoms']().value = patient.clinicalSymptoms;
    htmlSelectors['editPatientContainer']().style.display = 'block'
    htmlSelectors['editPatientButton']().setAttribute('data-key', id)
};

async function editPatient(patient, id) {
    const initObj = {
        method: "PATCH",
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify(patient)
    }
    clicked = false;
    await fetch(`${baseUrl}doctors/patients/${id}/.json`, initObj);
};

function validatePatient(patient) {
    const error = { message: '', isErrorPresent: false };
    if (patient.age === '') {
        error.message += 'Patient age must not be empty!';
        error.isErrorPresent = true;
    };

    if (!(onlyLettersRegex.test(patient.name))) {
        error.message += 'Invalid name';
        error.isErrorPresent = true;
    };

    if (!(symptomsRegex.test(patient.clinicalSymptoms))) {
        error.message += 'Patient should have at least 1 symptom!';
        error.isErrorPresent = true;
    };
    return error;
};

async function editPatientHandler(e) {
    const editPatientContainer = htmlSelectors['editPatientContainer']();
    const id = this.getAttribute('data-key');
    e.preventDefault();
    const patientNameElement = htmlSelectors['editPatientName']();
    const patientAgeElement = htmlSelectors['editPatientAge']();
    const clinicalSymptomsElement = htmlSelectors['editPatientSymptoms']();
    const patient = { name: patientNameElement.value, age: patientAgeElement.value, clinicalSymptoms: formatString(clinicalSymptomsElement.value) };
    const validateResult = validatePatient(patient);
    if (validateResult.isErrorPresent) {
        handleError(validateResult.message)
    } else {
        await editPatient(patient, id);
        clicked = false;
        const patients = await getAllPatients();
        renderPatients(patients)
    }
    clearInputFields(patientNameElement, patientAgeElement, clinicalSymptomsElement);
    editPatientContainer.style.display = 'none'
};

async function deletePatientHandler(e) {
    const id = this.getAttribute('data-key');
    const deletedPatient = await deletePatient(id);
    const patients = await getAllPatients();
    clicked = false;
    renderPatients(patients)
};

async function deletePatient(patientID) {
    let initObj = {
        method: "DELETE",
        headers: {
            'Content-type': 'application/json'
        }
    };
    await fetch(`${baseUrl}doctors/patients/${patientID}/.json`, initObj);
};

async function getPatient(id) {
    return await (await fetch(`${baseUrl}doctors/patients/${id}/.json`)).json();
};

async function getAllPatientsHandler() {
    const patients = await getAllPatients();
    renderPatients(patients)
};

async function getAllPatients() {
    return await (await fetch(`${baseUrl}doctors/patients/.json`)).json()
};

function handleError(error) {
    const errorContainer = htmlSelectors['errorContainer']();
    errorContainer.style.display = 'block';
    errorContainer.textContent = error;
    errorContainer.classList.add('alert')
    errorContainer.classList.add('alert-danger')
    setTimeout(() => {
        errorContainer.style.display = 'none'
        errorContainer.classList = [];
    }, 5000);
};

function clearInputFields(name, age, symptoms) {
    name.value = '';
    age.value = '';
    symptoms.value = ''
};