import { toast } from "./toast.js";
import {
  elContainer,
  elErrorText,
  elForm,
  elLoader,
  elTemplateCard,
} from "./html-elements.js";

const API_URL = "https://json-api.uz/api/project/fn44";
let TOKEN = localStorage.getItem("token");
let USERNAME = "abdulloh6741";
let PASSWORD = "theumarovmc2010";

if (!TOKEN || TOKEN === "undefined") {
  localStorage.removeItem("token");
  TOKEN = null;
}

async function loginUser() {
  if (TOKEN) {
    console.log("Oldingi tok ishlavotti:", TOKEN);
    return;
  }

  try {
    const regRes = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: USERNAME, password: PASSWORD }),
    });
    console.log("REGISTER:", await regRes.text());

    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: USERNAME, password: PASSWORD }),
    });

    const loginText = await loginRes.text();
    console.log("LOGIN:", loginText);
    const data = JSON.parse(loginText);
    TOKEN = data.access_token;
    localStorage.setItem("token", TOKEN);
    toast("Token olindi!");
  } catch (err) {
    console.error(" xatolik:", err);
    toast(" xatolik: " + err.message);
  }
}

function init() {
  elLoader.classList.remove("hidden");

  fetch(`${API_URL}/cars`)
    .then((res) => res.json())
    .then((res) => ui(res.data))
    .catch(() => (elErrorText.innerText = "Xatolik yuz berdi!"))
    .finally(() => elLoader.classList.add("hidden"));
}

function ui(cars) {
  elContainer.innerHTML = "";
  cars.forEach((car) => {
    const clone = elTemplateCard.cloneNode(true).content;
    const elTitle = clone.querySelector("h2");
    const elDesc = clone.querySelector("p");
    const elDeleteBtn = clone.querySelector(".js-delete");
    const elEditBtn = clone.querySelector(".js-edit");

    elTitle.textContent = car.name;
    elDesc.textContent = car.description;
    elDeleteBtn.addEventListener("click", () => {
      const isConfirm = confirm("Rostdan o‘chirmoqchimisiz?");
      if (isConfirm) {
        deleteCar(car.id);
        elDeleteBtn.innerText = "Loading . . .";
        init();
      }
    });
    elEditBtn.addEventListener("click", () => openEditModal(car));

    elContainer.appendChild(clone);
  });
}

function deleteCar(id) {
  fetch(`${API_URL}/cars/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  })
    .then((res) => {
      if (res.ok) {
        toast(`O‘chirildi!`);
        init();
      } else {
        toast(`O‘chirish mumkin emas!1`);
      }
    })
    .catch(() => toast("Xatolik yuz berdi!"));
}

elForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(elForm);
  const newCar = {
    name: formData.get("name"),
    description: formData.get("description"),
  };

  fetch(`${API_URL}/cars`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify(newCar),
  })
    .then((res) => res.json())
    .then(() => {
      toast("Mashina qo‘shildi!");
      init();
      elForm.reset();
    })
    .catch(() => toast("Mashina qo‘shishda xatolik!"));
});

const modalBg = document.getElementById("modalBg");
const closeModalBtn = document.getElementById("closeModal");
const saveBtn = modalBg.querySelector("button.bg-blue-600");
const inputTitle = modalBg.querySelector("input");
const inputDesc = modalBg.querySelector("textarea");
let editingId = null;

function openEditModal(car) {
  editingId = car.id;
  inputTitle.value = car.name;
  inputDesc.value = car.description;
  modalBg.classList.remove("hidden");
  modalBg.classList.add("flex");
}

function closeEditModal() {
  modalBg.classList.add("hidden");
  modalBg.classList.remove("flex");
  editingId = null;
}

closeModalBtn.addEventListener("click", closeEditModal);

saveBtn.addEventListener("click", () => {
  const updated = {
    name: inputTitle.value.trim(),
    description: inputDesc.value.trim(),
  };

  fetch(`${API_URL}/cars/${editingId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: TOKEN,
    },
    body: JSON.stringify(updated),
  })
    .then((res) => res.json())
    .then(() => {
      toast("Ma'lumot yangilandi!");
      closeEditModal();
      init();
    })
    .catch(() => toast("Tahrirlashda xatolik!"));
});

async function start() {
  await loginUser();
  init();
}

start();
