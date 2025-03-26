const MIN = 100;
const MAX = 999;
const pinInput = document.getElementById('pin');
const sha256HashView = document.getElementById('sha256-hash');
const resultView = document.getElementById('result');

// Store a key-value pair in localStorage
function store(key, value) {
  localStorage.setItem(key, value);
}

// Retrieve a value from localStorage
function retrieve(key) {
  return localStorage.getItem(key);
}

// Generate a random 3-digit number
function getRandomArbitrary(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

// Clear local storage and reset the challenge
function resetChallenge() {
  localStorage.clear();
  resultView.innerHTML = '';
  main(); // Regenerate new challenge
}

// Generate SHA256 hash of a given string
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Get or generate a SHA256 hash for a random 3-digit number
async function getSHA256Hash() {
  let cachedHash = retrieve('sha256');
  let cachedNumber = retrieve('originalNumber');

  if (cachedHash && cachedNumber) {
    return cachedHash;
  }

  let randomNum = getRandomArbitrary(MIN, MAX);
  cachedHash = await sha256(randomNum.toString());

  store('sha256', cachedHash);
  store('originalNumber', randomNum); // Store original number for debugging

  return cachedHash;
}

// Initialize the challenge
async function main() {
  sha256HashView.innerHTML = 'Calculating...';
  const hash = await getSHA256Hash();
  sha256HashView.innerHTML = hash;
}

// Check if user-entered PIN matches the stored hash
async function test() {
  const pin = pinInput.value;

  if (pin.length !== 3) {
    resultView.innerHTML = '💡 Not 3 digits';
    resultView.classList.remove('hidden');
    return;
  }

  const hasedPin = await sha256(pin);
  const storedHash = sha256HashView.innerHTML;

  if (hasedPin === storedHash) {
    resultView.innerHTML = '🎉 Success!';
    resultView.classList.add('success');
  } else {
    const originalNum = retrieve('originalNumber');
    resultView.innerHTML = `❌ Failed! (Hint: ${originalNum})`; // Show hint for debugging
  }
  resultView.classList.remove('hidden');
}

// Ensure pinInput only accepts numbers and is 3 digits long
pinInput.addEventListener('input', (e) => {
  pinInput.value = e.target.value.replace(/\D/g, '').slice(0, 3);
});

// Attach functions to buttons
document.getElementById('check').addEventListener('click', test);
document.getElementById('reset').addEventListener('click', resetChallenge);

main();
