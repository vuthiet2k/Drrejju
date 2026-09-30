const cache = new Map();
const TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

import { BASE_URL } from "@/helpers/api/axiosHttp.js";
import { useFetch } from "@/helpers/api/api.js";

async function fetchWithCache(endpoint, id, useProxy = true) {
  const proxy = useProxy ? BASE_URL + "/api" : "";
  const url = `${proxy}${endpoint}/${id}`;
  const key = `${endpoint}/${id}`;

  // Check in-memory cache
  const memoryEntry = cache.get(key);
  if (memoryEntry && Date.now() < memoryEntry.expiry) {
    return memoryEntry.data;
  }

  // Check localStorage cache
  // const localData = getCachedData(key);
  // if (localData) {
  //   cache.set(key, { data: localData, expiry: Date.now() + TTL }); // sync to memory
  //   return localData;
  // }

  // Fetch from server
  const data = await useFetch(url);
  // cache.set(key, { data, expiry: Date.now() + TTL });
  // setCachedData(key, data);
  return data;
}

function getCachedData(key) {
  const cached = localStorage.getItem(key);
  if (!cached) return null;

  try {
    const { data, expiry } = JSON.parse(cached);
    if (Date.now() > expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  } catch (e) {
    localStorage.removeItem(key);
    return null;
  }
}

function setCachedData(key, data) {
  const expiry = Date.now() + TTL;
  const payload = { data, expiry };
  localStorage.setItem(key, JSON.stringify(payload));
}

function clearAllCachedData() {
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    try {
      const val = JSON.parse(localStorage.getItem(key));
      if (
        val && typeof val === "object" &&
        Object.prototype.hasOwnProperty.call(val, "expiry") &&
        Object.prototype.hasOwnProperty.call(val, "data")
      ) {
        keysToRemove.push(key);
      }
    } catch (e) {
      // ignore non-JSON entries
    }
  }
  keysToRemove.forEach(k => localStorage.removeItem(k));
  return keysToRemove.length;
}

export { fetchWithCache, getCachedData, setCachedData, clearAllCachedData };