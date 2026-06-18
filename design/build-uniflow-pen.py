#!/usr/bin/env python3
"""Generate design/uniflow-mobile.pen from Uniflow app screen inventory."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

W, H, GAP = 390, 844, 40
C = {
    "bg": "#0a0a0b",
    "bg2": "#0f1011",
    "bg3": "#161719",
    "card": "#12131599",
    "text": "#ffffff",
    "muted": "#a1a1a1",
    "dim": "#666666",
    "brand": "#ff5c1a",
    "brandMuted": "#ff5c1a1a",
    "border": "#ffffff0d",
    "success": "#22c55e",
    "warning": "#f59e0b",
    "danger": "#ef4444",
    "info": "#3b82f6",
}


def t(
    id_: str,
    content: str,
    *,
    fill: str = C["text"],
    size: float = 14,
    weight: str = "400",
    align: str | None = None,
    width: str | float | None = None,
) -> dict[str, Any]:
    node: dict[str, Any] = {
        "type": "text",
        "id": id_,
        "fill": fill,
        "content": content,
        "fontFamily": "Inter",
        "fontSize": size,
        "fontWeight": weight,
    }
    if align:
        node["textAlign"] = align
    if width is not None:
        node["width"] = width
        node["textGrowth"] = "fixed-width"
    return node


def f(
    id_: str,
    name: str,
    *,
    x: float = 0,
    y: float = 0,
    width: str | float = W,
    height: str | float = H,
    layout: str = "vertical",
    gap: float = 12,
    padding: list[float] | None = None,
    fill: str = C["bg"],
    stroke: str | None = None,
    radius: float | None = None,
    children: list[dict[str, Any]] | None = None,
    justify: str | None = None,
    align: str | None = None,
    clip: bool = True,
) -> dict[str, Any]:
    node: dict[str, Any] = {
        "type": "frame",
        "id": id_,
        "x": x,
        "y": y,
        "name": name,
        "clip": clip,
        "width": width,
        "height": height,
        "fill": fill,
        "layout": layout,
    }
    if gap:
        node["gap"] = gap
    if padding is not None:
        node["padding"] = padding
    if stroke:
        node["stroke"] = stroke
        node["strokeWidth"] = 1
    if radius is not None:
        node["cornerRadius"] = radius
    if justify:
        node["justifyContent"] = justify
    if align:
        node["alignItems"] = align
    if children:
        node["children"] = children
    return node


def tab_bar(active: str, prefix: str) -> dict[str, Any]:
    tabs = [
        ("Home", "⌂", "home"),
        ("Schedule", "📅", "schedule"),
        ("Courses", "📚", "courses"),
        ("Resources", "📁", "resources"),
    ]
    return f(
        f"{prefix}TabBar",
        "Tab Bar",
        width="fill_container",
        height=72,
        layout="horizontal",
        gap=0,
        padding=[8, 12],
        fill=C["bg2"],
        stroke=C["border"],
        radius=20,
        justify="space_between",
        align="center",
        children=[
            f(
                f"{prefix}Tab{key.title()}",
                label,
                width="fill_container",
                height="fill_container",
                layout="vertical",
                gap=4,
                align="center",
                fill="transparent",
                clip=False,
                children=[
                    t(
                        f"{prefix}Tab{key.title()}Icon",
                        icon,
                        fill=C["brand"] if active == key else C["dim"],
                        size=18,
                    ),
                    t(
                        f"{prefix}Tab{key.title()}Label",
                        label,
                        fill=C["brand"] if active == key else C["dim"],
                        size=11,
                        weight="600" if active == key else "500",
                    ),
                ],
            )
            for label, icon, key in tabs
        ],
    )


def header_actions(prefix: str) -> dict[str, Any]:
    return f(
        f"{prefix}HeaderActions",
        "Header Actions",
        layout="horizontal",
        gap=10,
        align="center",
        fill="transparent",
        clip=False,
        children=[
            f(
                f"{prefix}NotifBtn",
                "Notifications",
                width=40,
                height=40,
                radius=12,
                fill=C["bg2"],
                stroke=C["border"],
                justify="center",
                align="center",
                children=[t(f"{prefix}NotifIcon", "🔔", fill=C["brand"], size=16)],
            ),
            f(
                f"{prefix}AvatarBtn",
                "Avatar",
                width=40,
                height=40,
                radius=20,
                fill=C["brandMuted"],
                stroke="#ff5c1a40",
                justify="center",
                align="center",
                children=[t(f"{prefix}AvatarInitial", "A", fill=C["brand"], size=16, weight="700")],
            ),
        ],
    )


def page_header(prefix: str, title: str, subtitle: str | None = None) -> dict[str, Any]:
    kids: list[dict[str, Any]] = [t(f"{prefix}PageTitle", title, size=26, weight="700")]
    if subtitle:
        kids.append(t(f"{prefix}PageSubtitle", subtitle, fill=C["dim"], size=13))
    return f(
        f"{prefix}PageHeader",
        "Page Header",
        width="fill_container",
        layout="vertical",
        gap=4,
        fill="transparent",
        clip=False,
        children=kids,
    )


def back_header(prefix: str, title: str) -> dict[str, Any]:
    return f(
        f"{prefix}BackHeader",
        "Back Header",
        width="fill_container",
        layout="horizontal",
        gap=12,
        align="center",
        fill="transparent",
        clip=False,
        children=[
            f(
                f"{prefix}BackBtn",
                "Back",
                width=36,
                height=36,
                radius=12,
                fill=C["bg2"],
                stroke=C["border"],
                justify="center",
                align="center",
                children=[t(f"{prefix}BackIcon", "←", fill=C["text"], size=18)],
            ),
            t(f"{prefix}BackTitle", title, size=18, weight="700"),
        ],
    )


def stat_card(prefix: str, label: str, value: str, icon: str) -> dict[str, Any]:
    return f(
        f"{prefix}Stat{label}",
        f"{label} Stat",
        width="fill_container",
        layout="vertical",
        gap=10,
        padding=14,
        fill=C["card"],
        stroke=C["border"],
        radius=14,
        children=[
            f(
                f"{prefix}Stat{label}Top",
                "Top",
                layout="horizontal",
                gap=6,
                align="center",
                fill="transparent",
                clip=False,
                children=[
                    t(f"{prefix}Stat{label}Icon", icon, fill=C["brand"], size=14),
                    t(f"{prefix}Stat{label}Label", label, fill=C["muted"], size=12, weight="500"),
                ],
            ),
            t(f"{prefix}Stat{label}Value", value, size=24, weight="700"),
        ],
    )


def class_card(prefix: str, code: str, title: str, meta: str, badge: str | None = None, accent: str = C["brand"]) -> dict[str, Any]:
    top: list[dict[str, Any]] = [t(f"{prefix}{code}Code", code, size=15, weight="700")]
    if badge:
        top.append(
            f(
                f"{prefix}{code}Badge",
                "Badge",
                padding=[4, 10],
                radius=8,
                fill="#f59e0b14",
                children=[t(f"{prefix}{code}BadgeText", badge, fill=C["warning"], size=11, weight="600")],
            )
        )
    return f(
        f"{prefix}Class{code}",
        "Class Card",
        width="fill_container",
        layout="horizontal",
        gap=12,
        padding=16,
        fill=C["card"],
        stroke=C["border"],
        radius=14,
        children=[
            f(f"{prefix}{code}Accent", "Accent", width=4, height="fill_container", radius=2, fill=accent),
            f(
                f"{prefix}{code}Body",
                "Body",
                width="fill_container",
                layout="vertical",
                gap=6,
                fill="transparent",
                clip=False,
                children=[
                    f(
                        f"{prefix}{code}Top",
                        "Top",
                        width="fill_container",
                        layout="horizontal",
                        justify="space_between",
                        align="center",
                        fill="transparent",
                        clip=False,
                        children=top,
                    ),
                    t(f"{prefix}{code}Title", title, fill=C["muted"], size=13),
                    t(f"{prefix}{code}Meta", meta, fill=C["dim"], size=12),
                ],
            ),
        ],
    )


def filter_chips(prefix: str, labels: list[str], active: int = 0) -> dict[str, Any]:
    return f(
        f"{prefix}Filters",
        "Filter Chips",
        width="fill_container",
        layout="horizontal",
        gap=8,
        fill="transparent",
        clip=False,
        children=[
            f(
                f"{prefix}Chip{i}",
                label,
                padding=[8, 14],
                radius=20,
                fill=C["brand"] if i == active else C["bg2"],
                stroke=C["brand"] if i == active else C["border"],
                children=[
                    t(
                        f"{prefix}Chip{i}Text",
                        label,
                        fill=C["text"] if i == active else C["muted"],
                        size=12,
                        weight="600" if i == active else "500",
                    )
                ],
            )
            for i, label in enumerate(labels)
        ],
    )


def screen_shell(
    id_: str,
    name: str,
    x: float,
    y: float,
    body: list[dict[str, Any]],
    *,
    active_tab: str | None = None,
    padding: list[float] | None = None,
) -> dict[str, Any]:
    kids = list(body)
    if active_tab:
        kids.append(tab_bar(active_tab, id_))
    return f(
        id_,
        name,
        x=x,
        y=y,
        layout="vertical",
        gap=16,
        padding=padding or [56, 20, 100, 20],
        children=kids,
    )


def login_screen() -> dict[str, Any]:
    return f(
        "loginScreen",
        "Login",
        x=0,
        y=0,
        layout="vertical",
        gap=24,
        padding=[56, 24, 32, 24],
        align="center",
        children=[
            f(
                "loginBrand",
                "Brand",
                layout="vertical",
                gap=12,
                align="center",
                fill="transparent",
                clip=False,
                children=[
                    f(
                        "loginLogoMark",
                        "Logo",
                        width=48,
                        height=48,
                        radius=14,
                        fill=C["brand"],
                        justify="center",
                        align="center",
                        children=[t("loginLogoLetter", "U", size=24, weight="700")],
                    ),
                    t("loginBrandName", "Uniflow", size=28, weight="700"),
                    t("loginTagline", "University intelligence, in your pocket", fill=C["dim"], size=14, align="center"),
                ],
            ),
            f(
                "loginCard",
                "Sign In Card",
                width="fill_container",
                layout="vertical",
                gap=20,
                padding=24,
                radius=20,
                fill=C["bg2"],
                stroke=C["border"],
                children=[
                    f(
                        "loginCardHeader",
                        "Header",
                        layout="vertical",
                        gap=6,
                        fill="transparent",
                        clip=False,
                        children=[
                            t("loginTitle", "Welcome back", size=22, weight="700"),
                            t("loginSubtitle", "Sign in to your account", fill=C["muted"]),
                        ],
                    ),
                    f(
                        "emailField",
                        "Email",
                        width="fill_container",
                        layout="vertical",
                        gap=8,
                        fill="transparent",
                        clip=False,
                        children=[
                            t("emailLabel", "Email address", fill=C["muted"], size=13, weight="500"),
                            f(
                                "emailInput",
                                "Input",
                                width="fill_container",
                                height=48,
                                radius=14,
                                fill=C["bg3"],
                                stroke=C["border"],
                                padding=[0, 16],
                                align="center",
                                children=[t("emailPlaceholder", "you@university.edu", fill=C["dim"], size=15)],
                            ),
                        ],
                    ),
                    f(
                        "passwordField",
                        "Password",
                        width="fill_container",
                        layout="vertical",
                        gap=8,
                        fill="transparent",
                        clip=False,
                        children=[
                            f(
                                "passwordLabelRow",
                                "Labels",
                                width="fill_container",
                                layout="horizontal",
                                justify="space_between",
                                align="center",
                                fill="transparent",
                                clip=False,
                                children=[
                                    t("passwordLabel", "Password", fill=C["muted"], size=13, weight="500"),
                                    t("forgotLink", "Forgot?", fill=C["brand"], size=13, weight="600"),
                                ],
                            ),
                            f(
                                "passwordInput",
                                "Input",
                                width="fill_container",
                                height=48,
                                radius=14,
                                fill=C["bg3"],
                                stroke=C["border"],
                                padding=[0, 16],
                                justify="space_between",
                                align="center",
                                children=[
                                    t("passwordPlaceholder", "Enter your password", fill=C["dim"], size=15),
                                    t("showPassword", "Show", fill=C["brand"], size=13, weight="600"),
                                ],
                            ),
                        ],
                    ),
                    f(
                        "signInButton",
                        "Sign In",
                        width="fill_container",
                        height=52,
                        radius=14,
                        fill=C["brand"],
                        justify="center",
                        align="center",
                        children=[t("signInLabel", "Sign in", size=16, weight="700")],
                    ),
                    t(
                        "tempPasswordHelp",
                        "Need a temporary password? Click here",
                        fill=C["dim"],
                        size=13,
                        align="center",
                        width="fill_container",
                    ),
                ],
            ),
            t("loginFooter", "Uniflow · Built for Nigerian universities", fill=C["dim"], size=12, align="center"),
        ],
    )


def student_home() -> dict[str, Any]:
    return screen_shell(
        "studentHome",
        "Student · Home",
        430,
        0,
        [
            f(
                "stuHomeHeader",
                "Header",
                width="fill_container",
                layout="horizontal",
                justify="space_between",
                fill="transparent",
                clip=False,
                children=[
                    f(
                        "stuHomeHeaderLeft",
                        "Greeting",
                        layout="vertical",
                        gap=4,
                        fill="transparent",
                        clip=False,
                        children=[
                            t("stuGreeting", "Good morning", fill=C["muted"], size=14, weight="500"),
                            t("stuName", "Adaobi", size=26, weight="700"),
                            t("stuDate", "Thursday, June 18", fill=C["dim"], size=13),
                        ],
                    ),
                    header_actions("stuHome"),
                ],
            ),
            f(
                "stuStats",
                "Stats",
                width="fill_container",
                layout="horizontal",
                gap=10,
                fill="transparent",
                clip=False,
                children=[
                    stat_card("stu", "Today", "3", "📅"),
                    stat_card("stu", "Courses", "6", "📚"),
                    stat_card("stu", "Alerts", "2", "⚡"),
                ],
            ),
            f(
                "stuAlertBanner",
                "Alert",
                width="fill_container",
                layout="horizontal",
                gap=8,
                padding=[12, 14],
                radius=12,
                fill=C["brandMuted"],
                stroke="#ff5c1a40",
                align="center",
                children=[
                    t("stuAlertIcon", "⚡", fill=C["brand"], size=13),
                    t("stuAlertText", "2 class updates today", fill=C["brand"], size=13, weight="600"),
                ],
            ),
            f(
                "stuTodaySection",
                "Today",
                width="fill_container",
                layout="vertical",
                gap=12,
                fill="transparent",
                clip=False,
                children=[
                    f(
                        "stuTodayHeader",
                        "Section",
                        width="fill_container",
                        layout="horizontal",
                        justify="space_between",
                        align="center",
                        fill="transparent",
                        clip=False,
                        children=[
                            t("stuTodayTitle", "Today's Classes", size=17, weight="700"),
                            t("stuSeeAll", "See all", fill=C["brand"], size=13, weight="600"),
                        ],
                    ),
                    class_card("stu", "CSC301", "Data Structures & Algorithms", "9:00 AM · LT 2 · Dr. Okafor", "Delayed"),
                    class_card("stu", "MTH201", "Linear Algebra II", "11:00 AM · Room 14 · Prof. Adeyemi", accent=C["success"]),
                ],
            ),
        ],
        active_tab="home",
    )


def student_schedule() -> dict[str, Any]:
    return screen_shell(
        "studentSchedule",
        "Student · Schedule",
        860,
        0,
        [
            page_header("stuSched", "Schedule", "Your weekly timetable"),
            f(
                "stuDayPicker",
                "Day Picker",
                width="fill_container",
                layout="horizontal",
                gap=6,
                fill="transparent",
                clip=False,
                children=[
                    f(
                        f"stuDay{day}",
                        day[:3],
                        width="fill_container",
                        padding=[10, 0],
                        radius=12,
                        fill=C["brand"] if day == "Thu" else C["bg2"],
                        stroke=C["brand"] if day == "Thu" else C["border"],
                        align="center",
                        children=[
                            t(
                                f"stuDay{day}Text",
                                day,
                                fill=C["text"] if day == "Thu" else C["muted"],
                                size=11,
                                weight="700" if day == "Thu" else "500",
                                align="center",
                            )
                        ],
                    )
                    for day in ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
                ],
            ),
            class_card("stuSched", "CSC301", "Data Structures & Algorithms", "9:00 – 11:00 AM · LT 2", "Delayed"),
            class_card("stuSched", "MTH201", "Linear Algebra II", "11:00 AM – 1:00 PM · Room 14", accent=C["success"]),
            class_card("stuSched", "GST102", " Nigerian People & Culture", "2:00 – 4:00 PM · Hall A"),
        ],
        active_tab="schedule",
    )


def student_courses() -> dict[str, Any]:
    card = f(
        "stuCourseCard1",
        "Course Card",
        width="fill_container",
        layout="vertical",
        gap=10,
        padding=16,
        fill=C["card"],
        stroke=C["border"],
        radius=14,
        children=[
            f(
                "stuCourseTags",
                "Tags",
                layout="horizontal",
                gap=8,
                fill="transparent",
                clip=False,
                children=[
                    f("stuCodeTag", "Code", padding=[4, 10], radius=8, fill=C["brandMuted"], children=[t("stuCodeText", "CSC 301", fill=C["brand"], size=12, weight="700")]),
                    f("stuLevelTag", "Level", padding=[4, 10], radius=8, fill=C["bg2"], stroke=C["border"], children=[t("stuLevelText", "300L", fill=C["muted"], size=12)]),
                    f("stuSemTag", "Sem", padding=[4, 10], radius=8, fill=C["bg2"], stroke=C["border"], children=[t("stuSemText", "Sem 1", fill=C["muted"], size=12)]),
                ],
            ),
            t("stuCourseTitle", "Data Structures & Algorithms", size=16, weight="700"),
            t("stuCourseLecturer", "Dr. Okafor", fill=C["dim"], size=12),
            f(
                "stuCourseStats",
                "Stats",
                layout="horizontal",
                gap=12,
                fill="transparent",
                clip=False,
                children=[
                    t("stuCourseUnits", "3 units", fill=C["muted"], size=12),
                    t("stuCourseSlots", "2 sessions/week", fill=C["muted"], size=12),
                ],
            ),
        ],
    )
    card2 = json.loads(json.dumps(card).replace("stuCourse", "stuCourse2").replace("stuCode", "stuCode2").replace("stuLevel", "stuLevel2").replace("stuSem", "stuSem2"))
    for node in card2.get("children", []):
        if node.get("id") == "stuCourse2Title":
            node["content"] = "Linear Algebra II"
        if node.get("id") == "stuCode2Text":
            node["content"] = "MTH 201"
    return screen_shell(
        "studentCourses",
        "Student · Courses",
        1290,
        0,
        [page_header("stuCourses", "My Courses", "6 enrolled courses"), card, card2],
        active_tab="courses",
    )


def student_resources() -> dict[str, Any]:
    res = f(
        "stuResCard1",
        "Resource",
        width="fill_container",
        layout="horizontal",
        gap=12,
        padding=14,
        fill=C["card"],
        stroke=C["border"],
        radius=14,
        children=[
            f("stuResIcon", "Icon", width=44, height=44, radius=12, fill="#ef444414", justify="center", align="center", children=[t("stuResIconText", "PDF", fill=C["danger"], size=11, weight="700")]),
            f(
                "stuResBody",
                "Body",
                width="fill_container",
                layout="vertical",
                gap=4,
                fill="transparent",
                clip=False,
                children=[
                    t("stuResTitle", "CSC 301 Past Questions 2024", size=14, weight="600"),
                    t("stuResMeta", "Past Question · CSC 301 · 2.4 MB", fill=C["dim"], size=12),
                ],
            ),
            t("stuResDl", "↓", fill=C["brand"], size=18, weight="700"),
        ],
    )
    res2 = json.loads(json.dumps(res).replace("stuRes", "stuRes2"))
    for child in res2.get("children", []):
        if child.get("id") == "stuRes2Body":
            for gc in child.get("children", []):
                if gc.get("id") == "stuRes2Title":
                    gc["content"] = "MTH 201 Lecture Notes"
                if gc.get("id") == "stuRes2Meta":
                    gc["content"] = "Note · MTH 201 · 1.1 MB"
    return screen_shell(
        "studentResources",
        "Student · Resources",
        1720,
        0,
        [
            page_header("stuRes", "Resources", "Course materials & past questions"),
            t("stuResFilterLabel", "Filter by course/type", fill=C["muted"], size=12, weight="600"),
            filter_chips("stuRes", ["All", "Past Questions", "Notes", "Materials"], 0),
            res,
            res2,
        ],
        active_tab="resources",
    )


def notif_item(prefix: str, suffix: str, title: str, msg: str, when: str, icon: str = "⚡") -> dict[str, Any]:
    return f(
        f"{prefix}Notif{suffix}",
        "Notification",
        width="fill_container",
        layout="horizontal",
        gap=12,
        padding=14,
        fill=C["card"],
        stroke=C["border"],
        radius=14,
        children=[
            f(
                f"{prefix}Notif{suffix}IconWrap",
                "Icon",
                width=40,
                height=40,
                radius=12,
                fill=C["brandMuted"],
                justify="center",
                align="center",
                children=[t(f"{prefix}Notif{suffix}Icon", icon, fill=C["brand"], size=16)],
            ),
            f(
                f"{prefix}Notif{suffix}Body",
                "Body",
                width="fill_container",
                layout="vertical",
                gap=4,
                fill="transparent",
                clip=False,
                children=[
                    t(f"{prefix}Notif{suffix}Title", title, size=14, weight="600"),
                    t(f"{prefix}Notif{suffix}Msg", msg, fill=C["muted"], size=12),
                    t(f"{prefix}Notif{suffix}Time", when, fill=C["dim"], size=11),
                ],
            ),
        ],
    )


def student_notifications() -> dict[str, Any]:
    return f(
        "studentNotifications",
        "Student · Notifications",
        x=2150,
        y=0,
        layout="vertical",
        gap=16,
        padding=[56, 20, 32, 20],
        children=[
            back_header("stuNotif", "Notifications"),
            f(
                "stuNotifActions",
                "Actions",
                width="fill_container",
                layout="horizontal",
                justify="space_between",
                align="center",
                fill="transparent",
                clip=False,
                children=[
                    t("stuNotifCount", "3 unread", fill=C["brand"], size=13, weight="600"),
                    t("stuMarkRead", "Mark all read", fill=C["muted"], size=13, weight="600"),
                ],
            ),
            notif_item("stu", "1", "CSC 301 class delayed", "Starts 30 minutes late today in LT 2", "2h ago"),
            notif_item("stu", "2", "New resource uploaded", "Week 4 notes added to CSC 301", "5h ago", "📚"),
            notif_item("stu", "3", "Schedule reminder", "MTH 201 starts in 1 hour", "Yesterday", "📅"),
        ],
    )


def student_profile() -> dict[str, Any]:
    return f(
        "studentProfile",
        "Student · Profile",
        x=2580,
        y=0,
        layout="vertical",
        gap=16,
        padding=[56, 20, 32, 20],
        children=[
            back_header("stuProf", "Profile"),
            f(
                "stuProfHero",
                "Hero",
                width="fill_container",
                layout="vertical",
                gap=12,
                padding=20,
                radius=16,
                fill=C["card"],
                stroke=C["border"],
                align="center",
                children=[
                    f("stuProfAvatar", "Avatar", width=72, height=72, radius=36, fill=C["brandMuted"], stroke="#ff5c1a40", justify="center", align="center", children=[t("stuProfAvatarText", "A", fill=C["brand"], size=28, weight="700")]),
                    t("stuProfName", "Adaobi Nwosu", size=20, weight="700"),
                    t("stuProfRole", "Student · 300 Level", fill=C["muted"], size=13),
                ],
            ),
            f(
                "stuProfInfo",
                "Info",
                width="fill_container",
                layout="vertical",
                gap=0,
                radius=16,
                fill=C["card"],
                stroke=C["border"],
                children=[
                    f("stuProfEmail", "Row", width="fill_container", padding=14, layout="horizontal", gap=12, align="center", fill="transparent", clip=False, children=[t("stuProfEmailIcon", "✉", fill=C["brand"]), f("stuProfEmailCol", "Col", layout="vertical", gap=2, fill="transparent", clip=False, children=[t("stuProfEmailLabel", "Email", fill=C["dim"], size=11), t("stuProfEmailVal", "adaobi@university.edu", size=14)])]),
                    f("stuProfDept", "Row", width="fill_container", padding=14, layout="horizontal", gap=12, align="center", fill="transparent", clip=False, children=[t("stuProfDeptIcon", "🎓", fill=C["brand"]), f("stuProfDeptCol", "Col", layout="vertical", gap=2, fill="transparent", clip=False, children=[t("stuProfDeptLabel", "Department", fill=C["dim"], size=11), t("stuProfDeptVal", "Computer Science", size=14)])]),
                ],
            ),
            f(
                "stuProfSettings",
                "Settings",
                width="fill_container",
                layout="vertical",
                gap=0,
                radius=16,
                fill=C["card"],
                stroke=C["border"],
                children=[
                    f("stuChangePass", "Row", width="fill_container", padding=14, layout="horizontal", justify="space_between", align="center", fill="transparent", clip=False, children=[t("stuChangePassText", "Change password", size=14), t("stuChangePassChev", "›", fill=C["dim"])]),
                    f("stuLogout", "Row", width="fill_container", padding=14, layout="horizontal", justify="space_between", align="center", fill="transparent", clip=False, children=[t("stuLogoutText", "Sign out", fill=C["danger"], size=14, weight="600"), t("stuLogoutChev", "›", fill=C["dim"])]),
                ],
            ),
        ],
    )


def lecturer_home() -> dict[str, Any]:
    return screen_shell(
        "lecturerHome",
        "Lecturer · Home",
        0,
        H + GAP,
        [
            f(
                "lecHomeHeader",
                "Header",
                width="fill_container",
                layout="horizontal",
                justify="space_between",
                fill="transparent",
                clip=False,
                children=[
                    f(
                        "lecHomeHeaderLeft",
                        "Greeting",
                        layout="vertical",
                        gap=4,
                        fill="transparent",
                        clip=False,
                        children=[
                            t("lecGreeting", "Good afternoon", fill=C["muted"], size=14, weight="500"),
                            t("lecName", "Dr. Okafor", size=26, weight="700"),
                            t("lecDate", "Thursday, June 18", fill=C["dim"], size=13),
                        ],
                    ),
                    header_actions("lecHome"),
                ],
            ),
            f(
                "lecStats",
                "Stats",
                width="fill_container",
                layout="horizontal",
                gap=10,
                fill="transparent",
                clip=False,
                children=[
                    stat_card("lec", "Today", "2", "📅"),
                    stat_card("lec", "Courses", "4", "📚"),
                    stat_card("lec", "Updates", "1", "⚡"),
                ],
            ),
            f(
                "lecTodaySection",
                "Today",
                width="fill_container",
                layout="vertical",
                gap=12,
                fill="transparent",
                clip=False,
                children=[
                    f(
                        "lecTodayHeader",
                        "Section",
                        width="fill_container",
                        layout="horizontal",
                        justify="space_between",
                        align="center",
                        fill="transparent",
                        clip=False,
                        children=[
                            t("lecTodayTitle", "Today's Classes", size=17, weight="700"),
                            t("lecSeeAll", "See all", fill=C["brand"], size=13, weight="600"),
                        ],
                    ),
                    class_card("lec", "CSC301", "Data Structures & Algorithms", "9:00 AM · LT 2"),
                    class_card("lec", "CSC401", "Software Engineering", "2:00 PM · Lab 3"),
                ],
            ),
            f(
                "lecUpcomingSection",
                "Upcoming",
                width="fill_container",
                layout="vertical",
                gap=12,
                fill="transparent",
                clip=False,
                children=[
                    t("lecUpcomingTitle", "Upcoming", size=17, weight="700"),
                    class_card("lecUp", "GST102", "Communication Skills", "Friday · 10:00 AM · Hall B"),
                ],
            ),
        ],
        active_tab="home",
    )


def lecturer_schedule() -> dict[str, Any]:
    return screen_shell(
        "lecturerSchedule",
        "Lecturer · Schedule",
        430,
        H + GAP,
        [
            page_header("lecSched", "Schedule", "Manage class updates"),
            f(
                "lecDayPicker",
                "Day Picker",
                width="fill_container",
                layout="horizontal",
                gap=6,
                fill="transparent",
                clip=False,
                children=[
                    f(
                        f"lecDay{day}",
                        day[:3],
                        width="fill_container",
                        padding=[10, 0],
                        radius=12,
                        fill=C["brand"] if day == "Thu" else C["bg2"],
                        stroke=C["brand"] if day == "Thu" else C["border"],
                        align="center",
                        children=[t(f"lecDay{day}Text", day, fill=C["text"] if day == "Thu" else C["muted"], size=11, weight="700" if day == "Thu" else "500", align="center")],
                    )
                    for day in ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
                ],
            ),
            class_card("lecSched", "CSC301", "Data Structures & Algorithms", "9:00 – 11:00 AM · LT 2 · Tap to update"),
            f(
                "lecStatusActions",
                "Status Actions",
                width="fill_container",
                layout="vertical",
                gap=8,
                fill="transparent",
                clip=False,
                children=[
                    t("lecStatusLabel", "Post class update", fill=C["muted"], size=12, weight="600"),
                    filter_chips("lecStatus", ["Ongoing", "Delayed", "Canceled", "Ended"], 1),
                ],
            ),
        ],
        active_tab="schedule",
    )


def lecturer_courses() -> dict[str, Any]:
    return screen_shell(
        "lecturerCourses",
        "Lecturer · Courses",
        860,
        H + GAP,
        [
            page_header("lecCourses", "My Courses", "4 assigned courses"),
            f(
                "lecCourseCard1",
                "Course",
                width="fill_container",
                layout="vertical",
                gap=10,
                padding=16,
                fill=C["card"],
                stroke=C["border"],
                radius=14,
                children=[
                    f("lecCourseTag", "Tag", padding=[4, 10], radius=8, fill=C["brandMuted"], children=[t("lecCourseCode", "CSC 301", fill=C["brand"], size=12, weight="700")]),
                    t("lecCourseTitle", "Data Structures & Algorithms", size=16, weight="700"),
                    t("lecCourseMeta", "300L · Sem 1 · 45 students", fill=C["dim"], size=12),
                ],
            ),
            f(
                "lecCourseCard2",
                "Course 2",
                width="fill_container",
                layout="vertical",
                gap=10,
                padding=16,
                fill=C["card"],
                stroke=C["border"],
                radius=14,
                children=[
                    f("lecCourseTag2", "Tag", padding=[4, 10], radius=8, fill=C["brandMuted"], children=[t("lecCourseCode2", "CSC 401", fill=C["brand"], size=12, weight="700")]),
                    t("lecCourseTitle2", "Software Engineering", size=16, weight="700"),
                    t("lecCourseMeta2", "400L · Sem 1 · 38 students", fill=C["dim"], size=12),
                ],
            ),
        ],
        active_tab="courses",
    )


def lecturer_resources() -> dict[str, Any]:
    return screen_shell(
        "lecturerResources",
        "Lecturer · Resources",
        1290,
        H + GAP,
        [
            f(
                "lecResHeaderRow",
                "Header Row",
                width="fill_container",
                layout="horizontal",
                justify="space_between",
                align="center",
                fill="transparent",
                clip=False,
                children=[
                    page_header("lecRes", "Resources", "Upload & manage files"),
                    f(
                        "lecUploadBtn",
                        "Upload",
                        padding=[10, 16],
                        radius=14,
                        fill="transparent",
                        stroke=C["brand"],
                        children=[t("lecUploadText", "+ Upload", fill=C["brand"], size=13, weight="700")],
                    ),
                ],
            ),
            t("lecResFilterLabel", "Filter by course/type", fill=C["muted"], size=12, weight="600"),
            filter_chips("lecRes", ["All", "Notes", "Materials", "Past Questions"], 0),
            f(
                "lecResCard1",
                "Resource",
                width="fill_container",
                layout="horizontal",
                gap=12,
                padding=14,
                fill=C["card"],
                stroke=C["border"],
                radius=14,
                children=[
                    f("lecResIcon", "Icon", width=44, height=44, radius=12, fill="#3b82f614", justify="center", align="center", children=[t("lecResIconText", "DOC", fill=C["info"], size=11, weight="700")]),
                    f(
                        "lecResBody",
                        "Body",
                        width="fill_container",
                        layout="vertical",
                        gap=4,
                        fill="transparent",
                        clip=False,
                        children=[
                            t("lecResTitle", "Week 4 Lecture Notes", size=14, weight="600"),
                            t("lecResMeta", "Note · CSC 301 · Uploaded today", fill=C["dim"], size=12),
                        ],
                    ),
                ],
            ),
        ],
        active_tab="resources",
    )


def lecturer_notifications() -> dict[str, Any]:
    return f(
        "lecturerNotifications",
        "Lecturer · Notifications",
        x=1720,
        y=H + GAP,
        layout="vertical",
        gap=16,
        padding=[56, 20, 32, 20],
        children=[
            back_header("lecNotif", "Notifications"),
            f(
                "lecNotifActions",
                "Actions",
                width="fill_container",
                layout="horizontal",
                justify="space_between",
                align="center",
                fill="transparent",
                clip=False,
                children=[
                    t("lecNotifCount", "1 unread", fill=C["brand"], size=13, weight="600"),
                    t("lecMarkRead", "Mark all read", fill=C["muted"], size=13, weight="600"),
                ],
            ),
            notif_item("lec", "1", "Student enrollment update", "3 new students in CSC 301", "1h ago", "📚"),
            notif_item("lec", "2", "Admin announcement", "Exam timetable published", "Yesterday", "ℹ️"),
        ],
    )


def lecturer_profile() -> dict[str, Any]:
    prof = json.loads(json.dumps(student_profile()).replace("stuProf", "lecProf").replace("stuChange", "lecChange").replace("stuLogout", "lecLogout"))
    prof["id"] = "lecturerProfile"
    prof["name"] = "Lecturer · Profile"
    prof["x"] = 2150
    prof["y"] = H + GAP
    for child in prof.get("children", []):
        if child.get("id") == "lecProfHero":
            for gc in child.get("children", []):
                if gc.get("id") == "lecProfName":
                    gc["content"] = "Dr. Emeka Okafor"
                if gc.get("id") == "lecProfRole":
                    gc["content"] = "Lecturer · Computer Science"
                if gc.get("id") == "lecProfAvatarText":
                    gc["content"] = "E"
        if child.get("id") == "lecProfInfo":
            for row in child.get("children", []):
                for gc in row.get("children", []):
                    if gc.get("id") == "lecProfEmailVal":
                        gc["content"] = "emeka.okafor@university.edu"
                    if gc.get("id") == "lecProfDeptVal":
                        gc["content"] = "Computer Science"
    prof["children"][0] = back_header("lecProf", "Profile")
    return prof


def section_label(text: str, x: float, y: float) -> dict[str, Any]:
    return f(
        f"label{text.replace(' ', '')}",
        text,
        x=x,
        y=y - 36,
        width=600,
        height=28,
        layout="none",
        fill="transparent",
        clip=False,
        children=[t(f"label{text.replace(' ', '')}Text", text, fill=C["brand"], size=18, weight="700")],
    )


def main() -> None:
    screens = [
        login_screen(),
        student_home(),
        student_schedule(),
        student_courses(),
        student_resources(),
        student_notifications(),
        student_profile(),
        lecturer_home(),
        lecturer_schedule(),
        lecturer_courses(),
        lecturer_resources(),
        lecturer_notifications(),
        lecturer_profile(),
    ]

    labels = [
        section_label("Auth", 0, 0),
        section_label("Student screens", 430, 0),
        section_label("Lecturer screens", 0, H + GAP),
    ]

    doc = {
        "version": "2.13",
        "name": "Uniflow Mobile — All Screens",
        "children": labels + screens,
        "variables": {
            "--bg-primary": {"type": "color", "value": C["bg"]},
            "--bg-secondary": {"type": "color", "value": C["bg2"]},
            "--bg-tertiary": {"type": "color", "value": C["bg3"]},
            "--bg-card": {"type": "color", "value": C["card"]},
            "--text-primary": {"type": "color", "value": C["text"]},
            "--text-secondary": {"type": "color", "value": C["muted"]},
            "--text-muted": {"type": "color", "value": C["dim"]},
            "--brand": {"type": "color", "value": C["brand"]},
            "--brand-muted": {"type": "color", "value": C["brandMuted"]},
            "--border-primary": {"type": "color", "value": C["border"]},
            "--success": {"type": "color", "value": C["success"]},
            "--warning": {"type": "color", "value": C["warning"]},
            "--danger": {"type": "color", "value": C["danger"]},
            "--info": {"type": "color", "value": C["info"]},
            "--radius-md": {"type": "number", "value": 14},
            "--radius-lg": {"type": "number", "value": 20},
        },
    }

    ids: list[str] = []

    def collect_ids(node: dict[str, Any]) -> None:
        if "id" in node:
            ids.append(node["id"])
        for child in node.get("children", []) or []:
            collect_ids(child)

    for child in doc["children"]:
        collect_ids(child)
    dupes = {i for i in ids if ids.count(i) > 1}
    if dupes:
        raise SystemExit(f"Duplicate node ids: {sorted(dupes)}")

    out = Path(__file__).with_name("uniflow-mobile.pen")
    out.write_text(json.dumps(doc, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {out} ({len(screens)} screens, {len(ids)} nodes)")


if __name__ == "__main__":
    main()