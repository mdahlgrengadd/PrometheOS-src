// Ensure we have an iconUrl for remote plugins if icon is not provided
if (!manifest.iconUrl && typeof manifest.icon !== "object") {
  // Set a default icon URL from an existing icon
  manifest.iconUrl =
    import.meta.env.BASE_URL + "/icons/34794_pictures_pictures.png";
}
