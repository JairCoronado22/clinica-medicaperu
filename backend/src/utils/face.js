// Compara dos descriptores faciales (distancia euclidiana)
const distance = (desc1, desc2) => {
  if (desc1.length !== desc2.length) return Infinity;
  let sum = 0;
  for (let i = 0; i < desc1.length; i++) {
    sum += (desc1[i] - desc2[i]) ** 2;
  }
  return Math.sqrt(sum);
};

// Busca el usuario más cercano entre una lista de descriptores
const findClosestUser = (users, descriptor, threshold = 0.6) => {
  let best = null;
  let minDist = Infinity;
  for (const user of users) {
    if (!user.face_descriptor) continue;
    const d = distance(descriptor, user.face_descriptor);
    if (d < minDist) {
      minDist = d;
      best = user;
    }
  }
  if (best && minDist < threshold) {
    return { user: best, distance: minDist };
  }
  return null;
};

module.exports = { findClosestUser };