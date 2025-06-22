<!-- SPDX-License-Identifier: MIT -->
<script lang="ts">
import VueFileToolbarMenu from "vue-file-toolbar-menu";

let tbDataForJs;

export default {
  components: { VueFileToolbarMenu },
  data() {
    return {
      active: {
        Bold: false,
        Italic: false,
        Underline: false,
        //
        Overline: false,
        Strikeout: false,
        Shadowed: false,
        Color: "#000000",
        CharBackColor: "#FFFFFF",
        //
        FontHeight: 12,
        CharFontName: "Noto Sans",
        //
        LeftPara: false,
        CenterPara: false,
        RightPara: false,
        JustifyPara: false,
        DefaultBullet: false,
      },
      font_name_list: [],
      disabled: true,  // startup default
    };
  },

  computed: {
    my_menu() {
      tbDataForJs = this;  // line may run multiple times
      // https://wiki.documentfoundation.org/Development/DispatchCommands
      return [
        {
          icon: "format_bold", title: "Bold",
          click: () => toggleFormatting('Bold', []),
          active: this.active['Bold'],
          disabled: this.disabled,
        },
        {
          icon: "format_italic", title: "Italic",
          click: () => toggleFormatting('Italic', []),
          active: this.active['Italic'],
          disabled: this.disabled,
        },
        {
          icon: "format_underline", title: "Underline",
          click: () => toggleFormatting('Underline', []),
          active: this.active['Underline'],
          disabled: this.disabled,
        },
        { is: "separator" },
        {
          icon: "format_overline", title: "Overline",
          click: () => toggleFormatting('Overline', []),
          active: this.active['Overline'],
          disabled: this.disabled,
        },
        {
          icon: "strikethrough_s", title: "Striketrough",
          click: () => toggleFormatting('Strikeout', []),
          active: this.active['Strikeout'],
          disabled: this.disabled,
        },
        {
          icon: "text_fields", title: "Shadowed",
          click: () => toggleFormatting('Shadowed', []),
          active: this.active['Shadowed'],
          disabled: this.disabled,
        },
        {
          title: "Character Color",
          is: "button-color",
          color: this.active['Color'],
          update_color: (color) => {
            const rgb = (color.rgba.r<<16) | (color.rgba.g<<8) | color.rgba.b;
            toggleFormatting('Color', [['Color', rgb]])
          },
          disabled: this.disabled,
        },
        {
          title: "Background Color",
          is: "button-color",
          color: this.active['CharBackColor'],
          update_color: (color) => {
            const rgb = (color.rgba.r<<16) | (color.rgba.g<<8) | color.rgba.b;
            toggleFormatting('CharBackColor', [['CharBackColor', rgb]])
          },
          disabled: this.disabled,
        },
        { is: "separator" },
        {
          icon: "text_increase", title: "Increase Font Size",
          click: () => toggleFormatting('Grow', []),
          disabled: this.disabled,
        },
        {
          icon: "text_decrease", title: "Decrease Font Size",
          click: () => toggleFormatting('Shrink', []),
          disabled: this.disabled,
        },
        {
          html: this.active['FontHeight'],
          title: "Font Size",
          chevron: true,
          menu: this.font_height_menu,
          menu_height: 450,
          disabled: this.disabled,
        },
        {
          html: this.active['CharFontName'],
          title: "Font Name",
          chevron: true,
          menu: this.font_name_menu,
          menu_height: 450,
          disabled: this.disabled,
        },
        { is: "separator" },
        {
          icon: "format_align_left", title: "Align Left",
          click: () => toggleFormatting('LeftPara', []),
          active: this.active['LeftPara'],
          disabled: this.disabled,
        },
        {
          icon: "format_align_center", title: "Align Center",
          click: () => toggleFormatting('CenterPara', []),
          active: this.active['CenterPara'],
          disabled: this.disabled,
        },
        {
          icon: "format_align_right", title: "Align Right",
          click: () => toggleFormatting('RightPara', []),
          active: this.active['RightPara'],
          disabled: this.disabled,
        },
        {
          icon: "format_align_justify", title: "Justified",
          click: () => toggleFormatting('JustifyPara', []),
          active: this.active['JustifyPara'],
          disabled: this.disabled,
        },
        {
          icon: "list", title: "Unordered List",
          click: () => toggleFormatting('DefaultBullet', []),
          active: this.active['DefaultBullet'],
          disabled: this.disabled,
        },
        { is: "separator" },
        {
          icon: "download", title: "Download ODT",
          click: () => btnDownloadFunc('btnOdt'),
          disabled: this.disabled,
        },
        {
          icon: "picture_as_pdf", title: "Download PDF",
          click: () => btnDownloadFunc('btnPdf'),
          disabled: this.disabled,
        },
      ];
    },
    font_height_menu() {
      // dynamic height list around the current value
      const font_height_list = [];
      const cur_height = this.active['FontHeight'];
      const cur_height_fl = Math.floor(cur_height);
      let height_start = cur_height_fl - 7;
      if (height_start < 1) height_start = 1;
      //                                 current
      // example: 12  : [   ,  ..., 11.9, 12  , 12.1, 13  , ...]
      // example: 12.1: [   ,  ..., 12  , 12.1, 12.2, 13  , ...]
      // example: 12.5: [..., 12  , 12.4, 12.5, 12.6, 13  , ...]
      // example: 12.9: [..., 12  , 12.8, 12.9, 13  , ... ,    ]
      for (let i=height_start; i < cur_height_fl; i++) font_height_list.push(i);
      const minus_01 = (cur_height*10 -1) / 10;  // fix floating point
      const  plus_01 = (cur_height*10 +1) / 10;  // fix floating point
      if (minus_01 > cur_height_fl) font_height_list.push(cur_height_fl);
      font_height_list.push(minus_01);
      font_height_list.push(cur_height);
      if (plus_01 < cur_height_fl+1) font_height_list.push(plus_01);
      for (let i=cur_height_fl+1; i <= cur_height_fl+7; i++) font_height_list.push(i);
      return font_height_list.map(font_height => {
        return {
          html: font_height,
          /* icon: (this.theme != "default" && cur_height == font_height) ? 'check' : false, */
          active: (cur_height == font_height),
          click: () => {
            toggleFormatting('FontHeight', [['FontHeight.Height', font_height]]),
            this.active['FontHeight'] = font_height;
          }
        };
      });
    },
    font_name_menu() {
      return this.font_name_list.map(font_name => {        return {
          html: font_name,
          /* icon: (this.theme != "default" && this.active['CharFontName'] == font_name) ? 'check' : false, */
          active: (this.active['CharFontName'] == font_name),
          click: () => {
            toggleFormatting('CharFontName', [['CharFontName.FamilyName', font_name]]);
            this.active['CharFontName'] = font_name;
          }
        };
      });
    }
    // Alternative font list: "DejaVu Sans, DejaVu Serif, Liberation Sans, Liberation Serif, Linux Biolinum G, Linux Libertine G, Noto Sans, Noto Serif, Open Symbol".split(",").map((x) => x.trim())
  },
  mounted() {
    // Store reference to this component globally so pre_soffice.js can access it
    window.vueControlBarComponent = this;
    
    // Call the global jsPassCtrlBar function once the component is mounted
    if (window.jsPassCtrlBar) {
      console.log('Calling jsPassCtrlBar with Vue component');
      window.jsPassCtrlBar(this);
    } else {
      console.log('jsPassCtrlBar not available yet, will be called when pre_soffice.js loads');
    }
  },
  methods: {
    init_control_bar: function() {
      // This method can be called externally if needed
      console.log('init_control_bar called');
      if (window.jsPassCtrlBar) {
        window.jsPassCtrlBar(this);
      }
    }
  }
};
</script>




<template>
  <div>
    <vue-file-toolbar-menu :content="my_menu" />
  </div>
</template>

<style scoped>
</style>
