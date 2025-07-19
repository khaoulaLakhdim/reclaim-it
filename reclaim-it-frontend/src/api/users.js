import api from "./auth";

// GET /users/{user_id}
// src/api/users.js
export function fetchUserById(id) {
    return api.get(`/users/${id}`).then(res => res.data);
}
  