document.addEventListener("DOMContentLoaded", () => {
  const newPass = document.getElementById("newPassword");
  const confirmPass = document.getElementById("confirmPassword");

  const toggleNew = document.getElementById("toggleNew");
  const toggleConfirm = document.getElementById("toggleConfirm");

  const form = document.getElementById("resetForm");
  const error = document.getElementById("error");

  function toggle(input) {
    input.type = input.type === "password" ? "text" : "password";
  }

  toggleNew.addEventListener("click", () => toggle(newPass));
  toggleConfirm.addEventListener("click", () => toggle(confirmPass));

  form.addEventListener("submit", (e) => {
    const password = newPass.value;
    const confirm = confirmPass.value;

    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{6,}$/;

    if (!regex.test(password)) {
      e.preventDefault();
      error.innerText = "Weak password (min 6, upper, lower, special)";
      error.style.display = "block";
      return;
    }

    if (password !== confirm) {
      e.preventDefault();
      error.innerText = "Passwords do not match";
      error.style.display = "block";
      return;
    }
  });
});
