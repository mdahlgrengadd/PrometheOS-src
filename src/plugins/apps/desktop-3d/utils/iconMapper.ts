import { DesktopIconData } from "../data/iconData";

/**
 * Maps desktop icon titles to BeOS-style PNG icon files from the public folder.
 * Uses a keyword matching approach to find the most appropriate icon for each title.
 */
export function getIconPathForTitle(title: string): string {
  // Map common desktop titles to specific BeOS icon filenames
  const iconKeywordMap: Record<string, string[]> = {
    // Documents & Editors
    Doc: ["text", "write", "paper", "document"],
    Calc: ["calculator"],
    Img: ["bitmap", "paint", "image", "picture"],
    Term: ["terminal", "shell"],
    Set: ["settings", "preferences", "wrench", "customize"],
    Mus: ["audio", "music", "sound", "player"],
    Fold: ["folder"],
    Mail: ["email", "mail", "envelope"],
    Web: ["browser", "globe", "netpositive", "internet"],
    Cal: ["calendar", "clock"],
    Game: ["game"],
    Chat: ["message", "chat"],
    Code: ["ide", "editor", "code"],
    Map: ["map"],
    Note: ["stickies", "note"],
    Shop: ["webshop", "shopping", "cart"],
    Cam: ["camera", "codycam"],
    Media: ["video", "player", "media"],
  };

  // Default icon if no match is found
  let iconKeywords = ["beos_orb", "beos_3d_logo"];

  // Get matching keywords for this title
  const title_lower = title.toLowerCase();
  for (const [key, keywords] of Object.entries(iconKeywordMap)) {
    if (key.toLowerCase() === title_lower) {
      iconKeywords = keywords;
      break;
    }
  }

  // Get list of all available icon files
  const iconFiles = Object.keys(iconFileMap).map((filename) =>
    filename.toLowerCase()
  );

  // Find the first icon file that matches any of our keywords
  for (const keyword of iconKeywords) {
    const matchingFile = iconFiles.find((filename) =>
      filename.includes(keyword.toLowerCase())
    );
    if (matchingFile) {
      return `${import.meta.env.BASE_URL}icons/${iconFileMap[matchingFile]}`;
    }
  }

  // Return a default icon if no match found
  return `${import.meta.env.BASE_URL}icons/34737_logo_beos_logo_beos.png`;
}

// Map of lowercase filenames to actual filenames (preserving case)
const iconFileMap: Record<string, string> = {
  "34684_aim_be_be_aim.png": "34684_aim_be_be_aim.png",
  "34685_display_beos_apple_17_beos_studio_display_apple_17_studio.png":
    "34685_display_beos_apple_17_beos_studio_display_apple_17_studio.png",
  "34686_acrobat_beos_acrobat_beos.png": "34686_acrobat_beos_acrobat_beos.png",
  "34688_ans_beos_ans_beos.png": "34688_ans_beos_ans_beos.png",
  "34689_beos_blocks_cubos_serv_app_beos_blocks_cubos_serv_app.png":
    "34689_beos_blocks_cubos_serv_app_beos_blocks_cubos_serv_app.png",
  "34690_apple_beos_terminal_beos_terminal_apple.png":
    "34690_apple_beos_terminal_beos_terminal_apple.png",
  "34691_beos_audio_loud_music_server_speaker_audio_beos_loud_music_server_speaker.png":
    "34691_beos_audio_loud_music_server_speaker_audio_beos_loud_music_server_speaker.png",
  "34692_beos_hosting_server_server_hosting_grey_beos_bebox_bebox_grey.png":
    "34692_beos_hosting_server_server_hosting_grey_beos_bebox_bebox_grey.png",
  "34693_bitmap_bitmap_beos_beos.png": "34693_bitmap_bitmap_beos_beos.png",
  "34694_beos_blocks_beos_blocks.png": "34694_beos_blocks_beos_blocks.png",
  "34696_burn_beos_beos_burn.png": "34696_burn_beos_beos_burn.png",
  "34697_burn_beos_burn_2_beos.png": "34697_burn_beos_burn_2_beos.png",
  "34698_cd_beos_cd_beos.png": "34698_cd_beos_cd_beos.png",
  "34699_beos_player_cd_beos_player_cd.png":
    "34699_beos_player_cd_beos_player_cd.png",
  "34700_beos_beos_clock_clock.png": "34700_beos_beos_clock_clock.png",
  "34702_settings_clock_settings_beos_clock_beos.png":
    "34702_settings_clock_settings_beos_clock_beos.png",
  "34703_wrench_wrench_customize_beos_customize_beos.png":
    "34703_wrench_wrench_customize_beos_customize_beos.png",
  "34704_desktop_beos_desktop_beos.png": "34704_desktop_beos_desktop_beos.png",
  "34705_beos_folder_documents_folder_documents_beos.png":
    "34705_beos_folder_documents_folder_documents_beos.png",
  "34709_beos_email_beos_email.png": "34709_beos_email_beos_email.png",
  "34710_envelope_mail_mail_envelope_email_email.png":
    "34710_envelope_mail_mail_envelope_email_email.png",
  "34713_beos_find_search_zoom_zoom_search_find_beos.png":
    "34713_beos_find_search_zoom_zoom_search_find_beos.png",
  "34714_beos_flash_beos_flash.png": "34714_beos_flash_beos_flash.png",
  "34719_beos_folder_beos_folder.png": "34719_beos_folder_beos_folder.png",
  "34721_generic_paper_beos_generic_paper_beos.png":
    "34721_generic_paper_beos_generic_paper_beos.png",
  "34722_globe_editor_globe_html_editor_html.png":
    "34722_globe_editor_globe_html_editor_html.png",
  "34723_beos_beos_drive_hard_drive_hard.png":
    "34723_beos_beos_drive_hard_drive_hard.png",
  "34724_book_help_manual_dictionary_book_dictionary_help_manual.png":
    "34724_book_help_manual_dictionary_book_dictionary_help_manual.png",
  "34733_settings_beos_keyboard_beos_keyboard.png":
    "34733_settings_beos_keyboard_beos_keyboard.png",
  "34736_beos_3d_logo_beos_logo.png": "34736_beos_3d_logo_beos_logo.png",
  "34737_logo_beos_logo_beos.png": "34737_logo_beos_logo_beos.png",
  "34739_daemon_mail_beos_beos_daemon_mail.png":
    "34739_daemon_mail_beos_beos_daemon_mail.png",
  "34742_email_hand_message_share_hand_beos_email_message_beos_share.png":
    "34742_email_hand_message_share_hand_beos_email_message_beos_share.png",
  "34744_mp3_mp3.png": "34744_mp3_mp3.png",
  "34745_surfing_beos_browser_netpositive_surfing_beos_browser_netpositive.png":
    "34745_surfing_beos_browser_netpositive_surfing_beos_browser_netpositive.png",
  "34749_beos_paint_beos_paint.png": "34749_beos_paint_beos_paint.png",
  "34754_beos_play_beos_play.png": "34754_beos_play_beos_play.png",
  "34756_beos_printer_beos_printer.png": "34756_beos_printer_beos_printer.png",
  "34760_beos_stickies_stickies_beos.png":
    "34760_beos_stickies_stickies_beos.png",
  "34763_terminal_beos_terminal_beos.png":
    "34763_terminal_beos_terminal_beos.png",
  "34764_beos_text_beos_text.png": "34764_beos_text_beos_text.png",
  "34768_video_beos_video_beos.png": "34768_video_beos_video_beos.png",
  "34769_video_beos_message_video_message_beos.png":
    "34769_video_beos_message_video_message_beos.png",
  "34775_disk_zip_disk_beos_zip_beos.png":
    "34775_disk_zip_disk_beos_zip_beos.png",
  "34780_codycam_codycam.png": "34780_codycam_codycam.png",
  "34788_globe_planet_globe_world_browser_world_browser_planet.png":
    "34788_globe_planet_globe_world_browser_world_browser_planet.png",
  "34791_installer_installer.png": "34791_installer_installer.png",
  "34792_idea_jabber_lightbulb_idea_jabber_lightbulb.png":
    "34792_idea_jabber_lightbulb_idea_jabber_lightbulb.png",
  "34794_pictures_pictures.png": "34794_pictures_pictures.png",
  "34796_webshop_shopping_ecommerce_webshop_cart_cart_ecommerce_shopping.png":
    "34796_webshop_shopping_ecommerce_webshop_cart_cart_ecommerce_shopping.png",
};
