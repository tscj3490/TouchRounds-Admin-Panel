import React, {StyleSheet, Dimensions, PixelRatio} from "react-native";
const {width, height, scale} = Dimensions.get("window"),
    vw = width / 100,
    vh = height / 100,
    vmin = Math.min(vw, vh),
    vmax = Math.max(vw, vh);

export default StyleSheet.create({
    "ft10": {
        "fontSize": 10
    },
    "ft12": {
        "fontSize": 12
    },
    "ft14": {
        "fontSize": 14
    },
    "red": {
        "color": "red"
    },
    "black": {
        "color": "black"
    },
    "white": {
        "color": "white"
    },
    "grey": {
        "color": "grey"
    },
    "info-color": {
        "color": "#1AAFD0"
    },
    "textarea": {
        "resize": "none !important",
        "outline": "none !important"
    },
    "input": {
        "outline": "none !important"
    },
    "pointer": {
        "cursor": "pointer"
    },
    "bodysidebar-default wrapper static-sidebar liactive:hover > a": {
        "color": "#ffffff",
        "background": "#3F7C95"
    },
    "bodysidebar-default wrapper static-sidebar liactive:hover > a > i": {
        "color": "#ffffff",
        "background": "#3F7C95"
    },
    "bodysidebar-default wrapper static-sidebar liactive > a": {
        "color": "#ffffff",
        "background": "#3F7C95"
    },
    "bodysidebar-default wrapper static-sidebar liactive > a > i": {
        "color": "#ffffff",
        "background": "#3F7C95"
    },
    "header-user-name": {
        "color": "#9BA2A7",
        "marginTop": 15,
        "marginRight": 10,
        "marginBottom": 15,
        "marginLeft": 10,
        "display": "inline-block",
        "fontSize": 14
    },
    "header-title": {
        "color": "black",
        "marginTop": 12,
        "marginRight": 10,
        "marginBottom": 12,
        "marginLeft": 10,
        "display": "inline-block",
        "fontSize": 18
    },
    "navbar-brand": {
        "font": "0/0 a !important",
        "color": "transparent !important",
        "textShadow": "none !important",
        "backgroundColor": "transparent !important",
        "border": "0 !important",
        "background": "url(\"../img/logo_small.png\") no-repeat 30px 10px !important",
        "height": "50px !important",
        "width": "190px !important"
    },
    "content-title": {
        "fontSize": 28,
        "fontWeight": "500",
        "color": "#707980"
    },
    "patient-task": {
        "paddingTop": 7,
        "paddingRight": 10,
        "paddingBottom": 7,
        "paddingLeft": 10,
        "borderBottom": "1px solid #E0E0E0 !important",
        "position": "relative",
        "fontSize": 14
    },
    "patient-taskwarning-task": {
        "background": "#EF553A",
        "color": "white"
    },
    "patient-taskwarning-task a": {
        "color": "white"
    },
    "patient-task notification-icon": {
        "width": 20,
        "height": 20,
        "marginRight": 5,
        "marginTop": 5
    },
    "patient-task a": {
        "color": "#707980"
    },
    "patient-task header-text": {
        "display": "inline-block",
        "width": "100%",
        "paddingLeft": 30,
        "verticalAlign": "top"
    },
    "patient-task setting-area": {
        "paddingTop": 10,
        "paddingRight": 10,
        "paddingBottom": 10,
        "paddingLeft": 10,
        "width": "100%"
    },
    "patient-task setting-area button": {
        "width": 100
    },
    "btn-login": {
        "background": "#00B7CE"
    },
    "btn-login:active": {
        "background": "#00B7CE"
    },
    "btn-login:focus": {
        "background": "#00B7CE"
    },
    "btn-login:hover": {
        "background": "#02C2DA"
    },
    "tablepatient-info-table th": {
        "background": "#f0f0f0",
        "paddingLeft": "10px !important",
        "paddingRight": "10px !important"
    },
    "tablepatient-info-table td": {
        "paddingTop": 2,
        "paddingRight": 0,
        "paddingBottom": "!important",
        "paddingLeft": 0,
        "lineHeight": "22px !important",
        "height": 29
    },
    "tablepatient-info-table td textarea": {
        "borderWidth": 0
    },
    "tablepatient-info-table td textarea:hover": {
        "borderWidth": 1
    },
    "tablepatient-info-table td textarea:focus": {
        "borderWidth": 1
    },
    "timeline > li timeline-body": {
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 20,
        "marginLeft": "14%",
        "paddingTop": 10,
        "paddingRight": 10,
        "paddingBottom": 10,
        "paddingLeft": 10,
        "color": "rgba(255, 255, 255, 0.75)",
        "position": "relative",
        "borderWidth": 2,
        "borderStyle": "solid",
        "borderRadius": 10,
        "backgroundColor": "#fff"
    },
    "timeline > li timeline-body spanchat-user-name": {
        "marginLeft": 20,
        "fontSize": 12
    },
    "timeline > li timeline-header spandate": {
        "float": "left",
        "fontSize": 12
    },
    "task-row": {},
    "task-row:hover": {
        "background": "transparent",
        "border": "1px solid #56B3D2",
        "borderWidth": "1px 0 1px 0 !important"
    },
    "task-rowselect": {
        "background": "#E8F7FB"
    },
    "task-row:hover patient-task": {
        "paddingTop": 6,
        "paddingBottom": 6
    },
    "buttonclose": {
        "fontSize": 24,
        "marginTop": -8,
        "opacity": 0.5
    },
    "panel": {
        "boxShadow": "0 1px 3px rgba(0,0,0,0.3)",
        "MozBoxShadow": "0 1px 3px rgba(0,0,0,0.3)",
        "WebkitBoxShadow": "0 1px 3px rgba(0,0,0,0.3)"
    },
    "btn-touchround": {
        "backgroundColor": "transparent !important",
        "borderWidth": 1,
        "paddingTop": 0,
        "paddingRight": 10,
        "paddingBottom": 0,
        "paddingLeft": 10,
        "lineHeight": 28,
        "fontSize": 14,
        "fontWeight": "500"
    },
    "btn-edit": {
        "color": "#1AAFD0 !important",
        "borderColor": "#1AAFD0 !important"
    },
    "btn-extend": {
        "color": "orange !important",
        "borderColor": "orange !important"
    },
    "btn-delete": {
        "color": "red !important",
        "borderColor": "red !important",
        "backgroundColor": "white",
        "webkitBoxShadow": "inset 0 0px 0px 1px rgba(255,0,0,0.8)",
        "boxShadow": "inset 0 0px 0px 1px rgba(255,0,0,0.8)"
    },
    "btn-delete-full": {
        "color": "white !important",
        "borderColor": "red !important",
        "backgroundColor": "red !important"
    },
    "btn-save": {
        "color": "white !important",
        "borderColor": "#1AAFD0 !important",
        "backgroundColor": "#1AAFD0 !important",
        "borderWidth": 1
    },
    "btn-patient-save:hover": {
        "opacity": 0.8
    },
    "btn-task-delete": {
        "borderWidth": 1,
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0,
        "lineHeight": 28,
        "height": 28,
        "fontSize": 12,
        "fontWeight": "500",
        "color": "red !important",
        "borderColor": "red !important",
        "backgroundColor": "white !important",
        "width": 60,
        "marginRight": 20
    },
    "btn-patient:hover": {
        "opacity": 0.8
    },
    "btn-default2": {
        "backgroundColor": "transparent !important",
        "borderWidth": 1,
        "paddingTop": 0,
        "paddingRight": 10,
        "paddingBottom": 0,
        "paddingLeft": 10,
        "lineHeight": 34,
        "fontSize": 14,
        "fontWeight": "500",
        "color": "#1AAFD0 !important",
        "borderColor": "#1AAFD0 !important"
    },
    "btn-default3": {
        "backgroundColor": "white",
        "borderWidth": 1,
        "lineHeight": 28,
        "fontSize": 14,
        "fontWeight": "500",
        "color": "#1AAFD0 !important",
        "borderColor": "#1AAFD0 !important",
        "borderRadius": "50%",
        "width": 28,
        "height": 28,
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0,
        "marginTop": 8
    },
    "btn-default2:hover": {
        "borderWidth": 3,
        "lineHeight": 30,
        "paddingTop": 0,
        "paddingRight": 8,
        "paddingBottom": 0,
        "paddingLeft": 8
    },
    "btn-default3:hover": {
        "fontWeight": "700"
    },
    "form ng-dirtyng-valid": {
        "border": "1px solid #e0e0e0",
        "color": "#707980"
    },
    "task-detail-title": {
        "fontSize": 36,
        "fontWeight": "400",
        "lineHeight": 50,
        "height": 50,
        "paddingTop": 0,
        "paddingRight": 10,
        "paddingBottom": 0,
        "paddingLeft": 50,
        "color": "black",
        "borderWidth": 0
    },
    "task-detail-title:hover": {
        "borderWidth": 1
    },
    "task-detail-title:focus": {
        "borderWidth": 1
    },
    "task-detail-buttons": {
        "borderBottom": "1px solid #e0e0e0",
        "paddingBottom": 10,
        "marginBottom": 10
    },
    "task-detail-status": {
        "position": "absolute",
        "top": 8,
        "left": 5,
        "cursor": "pointer",
        "width": 36
    },
    "task-detail-status-small": {
        "cursor": "pointer",
        "width": 15,
        "height": 15
    },
    "task-detail-status:hover": {
        "color": "#a36a29"
    },
    "ausername img": {
        "borderRadius": 0
    },
    "panelpanel-primary panel-heading": {
        "borderColor": "#1AAFD0"
    },
    "accordionpanel-primary panel-heading": {
        "borderColor": "#1AAFD0"
    },
    "sidebar nav-separator": {
        "paddingTop": 10,
        "paddingRight": 16,
        "paddingBottom": 7,
        "paddingLeft": 16,
        "fontSize": 11,
        "background": "#293136"
    },
    "btn-task-detail": {
        "height": 28,
        "fontSize": 12,
        "background": "white"
    },
    "btn-task-detailactive": {
        "background": "#DDDDDD"
    },
    "btn-red-alt": {
        "color": "red !important",
        "border": "1px solid red",
        "backgroundColor": "white",
        "opacity": 1
    },
    "btn-red-alt:hover": {
        "opacity": 0.8
    },
    "btn-pink-alt": {
        "color": "white !important",
        "border": "1px solid red",
        "backgroundColor": "#FC91AD",
        "opacity": 1
    },
    "btn-pink-alt:hover": {
        "opacity": 0.8
    },
    "btn-orange-alt": {
        "color": "orange",
        "border": "1px solid orange",
        "background": "transparent"
    },
    "btn-orange-alt:hover": {
        "color": "#FF7700",
        "border": "1px solid #FF7700",
        "background": "transparent"
    },
    "editableTD": {
        "marginTop": 0,
        "marginRight": "!important",
        "marginBottom": 0,
        "marginLeft": "!important",
        "paddingTop": 0,
        "paddingRight": "!important",
        "paddingBottom": 0,
        "paddingLeft": "!important",
        "border": "none"
    },
    "editableTD input": {
        "marginTop": -1,
        "borderWidth": "1px 0 0 0",
        "borderColor": "#e0e0e0"
    },
    "editableTD input:hover": {
        "borderColor": "#1AAFD0",
        "borderWidth": "1px 0 1px 0"
    },
    "editableTD input:focus": {
        "borderColor": "#1AAFD0",
        "borderWidth": "1px 0 1px 0",
        "zIndex": 100,
        "background": "#E8F7FB"
    },
    "form-horizontal control-label": {
        "paddingTop": 8,
        "paddingBottom": 0,
        "fontWeight": "bold"
    },
    "form-control-static": {
        "paddingTop": 8,
        "paddingBottom": 0,
        "fontWeight": "bold"
    },
    "deadline-label": {
        "fontSize": 12,
        "lineHeight": 24,
        "paddingRight": 10
    },
    "bubble-left": {
        "position": "relative",
        "paddingTop": 5,
        "paddingRight": 10,
        "paddingBottom": 5,
        "paddingLeft": 10,
        "background": "#e0e0e0",
        "WebkitBorderRadius": 5,
        "MozBorderRadius": 5,
        "borderRadius": 5,
        "marginLeft": 25
    },
    "bubble-left:after": {
        "content": "",
        "position": "absolute",
        "top": 19,
        "left": -20,
        "borderStyle": "solid",
        "borderWidth": "8px 20px 8px 0",
        "borderColor": "transparent #e0e0e0",
        "display": "block",
        "width": 0,
        "zIndex": 1
    },
    "bubble-right": {
        "position": "relative",
        "paddingTop": 5,
        "paddingRight": 10,
        "paddingBottom": 5,
        "paddingLeft": 10,
        "background": "#C7E5EA",
        "WebkitBorderRadius": 5,
        "MozBorderRadius": 5,
        "borderRadius": 5,
        "marginRight": 25,
        "textAlign": "right"
    },
    "bubble-right:after": {
        "content": "",
        "position": "absolute",
        "top": 19,
        "right": -20,
        "borderStyle": "solid",
        "borderWidth": "8px 0 8px 20px",
        "borderColor": "transparent #C7E5EA",
        "display": "block",
        "width": 0,
        "zIndex": 1
    },
    "sidebar sidebar-img-bullet": {
        "width": 12,
        "height": 12,
        "marginRight": 12,
        "marginTop": -3
    },
    "sidebar i": {
        "marginRight": 12
    },
    "bootbox-confirm btn-primary": {
        "color": "#ffffff",
        "backgroundColor": "#05a7cf",
        "borderColor": "#0493b6"
    },
    "bootbox-confirm btn-primary:hover": {
        "backgroundColor": "#0493b6"
    },
    "stepy-navigator button-back": {
        "color": "#ffffff",
        "backgroundColor": "#05a7cf",
        "borderColor": "#0493b6",
        "marginLeft": 10
    },
    "stepy-navigator button-next": {
        "color": "#ffffff",
        "backgroundColor": "#05a7cf",
        "borderColor": "#0493b6",
        "marginLeft": 10
    },
    "stepy-navigator button-back:hover": {
        "backgroundColor": "#0493b6"
    },
    "stepy-navigator button-next:hover": {
        "backgroundColor": "#0493b6"
    },
    "page-heading breadcrumb > li": {
        "fontSize": "14px !important",
        "lineHeight": 14
    },
    "page-heading a": {
        "color": "#1AAFD0"
    },
    "ui-pnotify-title": {
        "display": "none !important"
    },
    "ui-pnotify-icon": {
        "display": "none !important"
    },
    "ui-pnotify-sticker": {
        "display": "none !important"
    },
    "ui-pnotify-closer": {
        "display": "none !important"
    },
    "printTable": {
        "display": "inline-flex",
        "width": "100%",
        "borderLeft": "1px solid #e0e0e0",
        "pageBreakAfter": "always",
        "fontSize": 10
    },
    "printTable:last-child": {
        "borderBottom": "1px solid #e0e0e0"
    },
    "printTable-header": {
        "width": "20%",
        "float": "left",
        "display": "inline-block",
        "borderWidth": "1px 1px 1px 0",
        "borderColor": "#e0e0e0",
        "borderStyle": "solid",
        "paddingTop": 5,
        "paddingRight": 5,
        "paddingBottom": 5,
        "paddingLeft": 5,
        "background": "#f0f0f0",
        "pageBreakAfter": "always"
    },
    "printTable-cell": {
        "width": "20%",
        "float": "left",
        "display": "table-cell",
        "borderWidth": "1px 1px 1px 0",
        "borderColor": "#e0e0e0",
        "borderStyle": "solid",
        "paddingTop": 5,
        "paddingRight": 5,
        "paddingBottom": 5,
        "paddingLeft": 5,
        "pageBreakAfter": "always",
        "pageBreakInside": "avoid"
    },
    "print-task-item": {
        "fontSize": 14,
        "lineHeight": 14,
        "paddingRight": 5
    },
    "print-panel panel-heading": {
        "height": "0px !important"
    },
    "print-title": {
        "fontSize": 12,
        "paddingBottom": 5
    },
    "archive-task-link": {
        "paddingLeft": 30,
        "fontSize": 14
    },
    "archive-task-link a": {
        "color": "#1AAFD0"
    },
    "spantime": {
        "fontSize": 11,
        "fontStyle": "italic"
    },
    "chat-box": {
        "height": 450,
        "overflow": "auto",
        "border": "1px solid #e0e0e0",
        "marginTop": 10,
        "listStyle": "none",
        "paddingTop": 10,
        "paddingRight": 10,
        "paddingBottom": 10,
        "paddingLeft": 10
    },
    "chat-row": {
        "fontSize": 14,
        "position": "relative",
        "width": "100%",
        "paddingBottom": 5,
        "display": "inline-block"
    },
    "dropdown-menuinvites": {
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0,
        "zIndex": 1300,
        "width": 300
    },
    "dropdown-menuinvites dd-header": {
        "paddingTop": 5,
        "paddingRight": 5,
        "paddingBottom": 5,
        "paddingLeft": 5,
        "borderBottom": "1px solid #e0e0e0",
        "fontSize": 14,
        "textAlign": "center"
    },
    "dropdown-menuinvites invite-item": {
        "paddingTop": 10,
        "paddingRight": 10,
        "paddingBottom": 10,
        "paddingLeft": 10,
        "fontSize": 14,
        "background": "#FFFAF0",
        "borderBottom": "1px solid #e0e0e0"
    },
    "dropdown-menuinvites invite-item msg": {
        "paddingLeft": 5,
        "width": 140,
        "display": "inline-block",
        "lineHeight": 29
    },
    "dropdown-menuinvites invite-item time": {
        "lineHeight": 29
    },
    "btn-invite": {
        "position": "absolute",
        "right": 20,
        "top": 25,
        "zIndex": 100
    },
    "bodysidebar-collapsed static-sidebar-wrapper": {
        "width": "0px !important"
    },
    "bodysidebar-collapsed static-sidebar-wrapper > div": {
        "width": "0px !important"
    },
    "btn-expand": {
        "width": 150
    },
    "btn-compact": {
        "paddingLeft": 10,
        "paddingRight": 10
    },
    "trpatient-list": {},
    "trpatient-listselected": {
        "background": "#f0f0f0"
    },
    "bodysidebar-midnightblue wrapper static-sidebar nav-separator": {
        "background": "#37444E",
        "color": "#92a4b2"
    },
    "auserlist-header": {
        "color": "#707980",
        "textDecoration": "underline",
        "fontSize": 14
    },
    "pagination > li > a:hover": {
        "color": "#1AAFD0"
    },
    "pagination > li > span:hover": {
        "color": "#1AAFD0"
    },
    "pagination > li > a:focus": {
        "color": "#1AAFD0"
    },
    "pagination > li > span:focus": {
        "color": "#1AAFD0"
    },
    "pagination > li > a": {
        "color": "#1AAFD0"
    },
    "pagination > li > span": {
        "color": "#1AAFD0"
    },
    "pagination > active > a": {
        "zIndex": 2,
        "color": "#fff",
        "backgroundColor": "#1AAFD0",
        "borderColor": "#1AAFD0",
        "cursor": "default"
    },
    "pagination > active > span": {
        "zIndex": 2,
        "color": "#fff",
        "backgroundColor": "#1AAFD0",
        "borderColor": "#1AAFD0",
        "cursor": "default"
    },
    "pagination > active > a:hover": {
        "zIndex": 2,
        "color": "#fff",
        "backgroundColor": "#1AAFD0",
        "borderColor": "#1AAFD0",
        "cursor": "default"
    },
    "pagination > active > span:hover": {
        "zIndex": 2,
        "color": "#fff",
        "backgroundColor": "#1AAFD0",
        "borderColor": "#1AAFD0",
        "cursor": "default"
    },
    "pagination > active > a:focus": {
        "zIndex": 2,
        "color": "#fff",
        "backgroundColor": "#1AAFD0",
        "borderColor": "#1AAFD0",
        "cursor": "default"
    },
    "pagination > active > span:focus": {
        "zIndex": 2,
        "color": "#fff",
        "backgroundColor": "#1AAFD0",
        "borderColor": "#1AAFD0",
        "cursor": "default"
    },
    "bootbox btn-primary": {
        "backgroundColor": "#1AAFD0 !important",
        "borderColor": "#1AAFD0 !important"
    },
    "bootbox btn-primary:hover": {
        "backgroundColor": "#1AAFD0 !important",
        "borderColor": "#1AAFD0 !important",
        "opacity": 0.8
    }
});