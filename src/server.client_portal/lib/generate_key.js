function generateKey() {
  let output = '';
  const allowed = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < 25; i += 1) {
    output += allowed.charAt(Math.floor(Math.random() * allowed.length));
  }

  return output;
}

export default generateKey;
