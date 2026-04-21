from manim import *
BG="#1A1A2E"; ACCENT="#FFCC00"; WHITE="#FFFFFF"; SUBTEXT="#A8B2C8"; POSITIVE="#4BFF8C"; NEGATIVE="#FF4B4B"; BLUE_HL="#4B9EFF"
config.pixel_width=1080; config.pixel_height=1920; config.frame_width=9; config.frame_height=16; config.frame_rate=30


class MathReel(Scene):
    """
    TOPIC: Forgetting Curve + Spaced Repetition
    DURATION: ~40 seconds
    """

    def construct(self):
        self.camera.background_color = BG

        # ── Brand watermark ──────────────────────────────────────────────────
        brand = Text("CUEMATH", font_size=30, color=ACCENT, weight=BOLD) \
            .to_edge(UP, buff=0.35)
        self.add(brand)

        # ════════════════════════════════════════════════════════════════════
        # SCENE 1: HOOK
        # ════════════════════════════════════════════════════════════════════
        hook_line1 = Text("Kids forget", font_size=100, color=WHITE, weight=BOLD)
        hook_line2 = Text("90% of what", font_size=100, color=NEGATIVE, weight=BOLD)
        hook_line3 = Text("they learn.", font_size=100, color=WHITE, weight=BOLD)
        hook = VGroup(hook_line1, hook_line2, hook_line3) \
            .arrange(DOWN, buff=0.3) \
            .scale_to_fit_width(7.8) \
            .move_to(ORIGIN)

        sub_hook = Text("Here's the science.", font_size=48, color=SUBTEXT) \
            .scale_to_fit_width(6.0) \
            .next_to(hook, DOWN, buff=0.6)

        self.play(FadeIn(hook_line1, shift=UP * 0.3), run_time=0.6)
        self.play(FadeIn(hook_line2, shift=UP * 0.3), run_time=0.6)
        self.play(FadeIn(hook_line3, shift=UP * 0.3), run_time=0.6)
        self.play(FadeIn(sub_hook), run_time=0.5)
        self.wait(2.0)
        self.play(FadeOut(VGroup(hook, sub_hook)), run_time=0.6)

        # ════════════════════════════════════════════════════════════════════
        # SCENE 2: THE FORGETTING CURVE
        # ════════════════════════════════════════════════════════════════════
        sec2_title = Text("The Forgetting Curve", font_size=54, color=ACCENT, weight=BOLD) \
            .scale_to_fit_width(8.0) \
            .to_edge(UP, buff=1.4)

        subtitle = Text("Memory fades fast without review", font_size=36, color=SUBTEXT) \
            .scale_to_fit_width(7.5) \
            .next_to(sec2_title, DOWN, buff=0.25)

        axes = Axes(
            x_range=[0, 7, 1],
            y_range=[0, 100, 25],
            x_length=7.2,
            y_length=5.2,
            axis_config={
                "color": SUBTEXT,
                "stroke_width": 2,
                "include_numbers": True,
                "font_size": 26,
                "decimal_number_config": {"color": SUBTEXT},
            },
            tips=False,
        ).shift(DOWN * 1.5)

        x_lbl = Text("Days after learning", font_size=32, color=SUBTEXT) \
            .scale_to_fit_width(4.5) \
            .next_to(axes, DOWN, buff=0.35)
        y_lbl = Text("Memory %", font_size=32, color=SUBTEXT) \
            .scale_to_fit_width(2.2) \
            .next_to(axes, LEFT, buff=0.2) \
            .rotate(PI / 2)

        forget_curve = axes.plot(
            lambda x: 100 * (2.71828 ** (-0.65 * x)),
            x_range=[0, 7],
            color=NEGATIVE,
            stroke_width=6,
        )
        shade = axes.get_area(forget_curve, x_range=[0, 7], color=NEGATIVE, opacity=0.10)

        # Annotation dot + label at day 1
        dot_d1 = Dot(axes.c2p(1, 100 * (2.71828 ** (-0.65))), color=WHITE, radius=0.10)
        lbl_d1 = Text("~52%", font_size=32, color=WHITE) \
            .next_to(dot_d1, UR, buff=0.15)

        # Annotation dot + label at day 7
        dot_d7 = Dot(axes.c2p(7, 100 * (2.71828 ** (-0.65 * 7))), color=NEGATIVE, radius=0.10)
        lbl_d7 = Text("~1%", font_size=32, color=NEGATIVE) \
            .next_to(dot_d7, UR, buff=0.15)

        self.play(FadeIn(sec2_title, shift=DOWN * 0.2), FadeIn(subtitle), run_time=0.7)
        self.play(Create(axes), Write(x_lbl), Write(y_lbl), run_time=1.2)
        self.play(Create(forget_curve), FadeIn(shade), run_time=1.8)
        self.play(FadeIn(dot_d1), Write(lbl_d1), run_time=0.5)
        self.play(FadeIn(dot_d7), Write(lbl_d7), run_time=0.5)
        self.wait(2.0)
        self.play(FadeOut(VGroup(
            sec2_title, subtitle, axes, forget_curve, shade,
            x_lbl, y_lbl, dot_d1, lbl_d1, dot_d7, lbl_d7
        )), run_time=0.7)

        # ════════════════════════════════════════════════════════════════════
        # SCENE 3: SPACED REPETITION — THE FIX
        # ════════════════════════════════════════════════════════════════════
        sec3_title = Text("Spaced Repetition Fixes This",
                          font_size=52, color=ACCENT, weight=BOLD) \
            .scale_to_fit_width(8.0) \
            .to_edge(UP, buff=1.4)

        sec3_sub = Text("Review at the right moment = memory locked in",
                        font_size=34, color=SUBTEXT) \
            .scale_to_fit_width(7.8) \
            .next_to(sec3_title, DOWN, buff=0.3)

        steps = VGroup(
            Text("Day 1    →  Learn concept",        font_size=42, color=WHITE),
            Text("Day 3    →  Quick review",          font_size=42, color=WHITE),
            Text("Day 7    →  Recall test",           font_size=42, color=BLUE_HL),
            Text("Day 14  →  Near full retention",   font_size=42, color=POSITIVE),
            Text("Day 30  →  Long-term mastery  ✓", font_size=42, color=POSITIVE),
        ).arrange(DOWN, buff=0.55, aligned_edge=LEFT) \
         .scale_to_fit_width(8.2) \
         .shift(DOWN * 0.5)

        # Draw small memory-recovery arrows next to each step
        self.play(FadeIn(sec3_title, shift=DOWN * 0.2), FadeIn(sec3_sub), run_time=0.7)
        for i, step in enumerate(steps):
            self.play(FadeIn(step, shift=RIGHT * 0.35), run_time=0.40)
        self.wait(1.8)
        self.play(FadeOut(VGroup(sec3_title, sec3_sub, steps)), run_time=0.7)

        # ════════════════════════════════════════════════════════════════════
        # SCENE 4: CTA
        # ════════════════════════════════════════════════════════════════════
        cta_top = Text("Make learning stick.", font_size=82, color=WHITE, weight=BOLD,
                       line_spacing=1.1) \
            .scale_to_fit_width(7.8) \
            .shift(UP * 1.0)

        cta_sub = Text("Cuemath uses spaced repetition\nto build real mastery.",
                       font_size=44, color=SUBTEXT, line_spacing=1.2) \
            .scale_to_fit_width(7.4) \
            .next_to(cta_top, DOWN, buff=0.65)

        cta_btn = Text("Try Cuemath →", font_size=60, color=ACCENT, weight=BOLD) \
            .scale_to_fit_width(6.5) \
            .next_to(cta_sub, DOWN, buff=0.8)

        box = SurroundingRectangle(cta_btn, color=ACCENT, buff=0.25, stroke_width=3,
                                   corner_radius=0.2)

        self.play(FadeIn(cta_top, shift=UP * 0.4), run_time=0.9)
        self.play(FadeIn(cta_sub), run_time=0.7)
        self.play(Write(cta_btn), Create(box), run_time=1.0)
        self.wait(2.8)
        self.play(FadeOut(VGroup(cta_top, cta_sub, cta_btn, box, brand)), run_time=0.8)