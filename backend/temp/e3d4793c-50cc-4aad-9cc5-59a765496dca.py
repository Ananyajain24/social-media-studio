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

        # ── Always-visible brand watermark ──────────────────────────────────
        brand = Text("CUEMATH", font_size=30, color=ACCENT, weight=BOLD).to_edge(UP, buff=0.35)
        self.add(brand)

        # ════════════════════════════════════════════════════════════════════
        # SCENE 1: HOOK
        # ════════════════════════════════════════════════════════════════════
        hook_line1 = Text("Your child aced\nthe test...", font_size=82, color=WHITE, weight=BOLD, line_spacing=1.2).scale_to_fit_width(7.8)
        hook_line2 = Text("So why did they\nforget it ALL?", font_size=82, color=NEGATIVE, weight=BOLD, line_spacing=1.2).scale_to_fit_width(7.8)

        hook_line1.shift(UP * 0.5)
        hook_line2.shift(DOWN * 2.2)

        self.play(FadeIn(hook_line1, shift=UP * 0.4), run_time=1.0)
        self.wait(1.2)
        self.play(FadeIn(hook_line2, shift=UP * 0.3), run_time=0.9)
        self.wait(1.8)
        self.play(FadeOut(VGroup(hook_line1, hook_line2)), run_time=0.6)

        # ════════════════════════════════════════════════════════════════════
        # SCENE 2: THE FORGETTING CURVE
        # ════════════════════════════════════════════════════════════════════
        sec2_title = Text("The Forgetting Curve", font_size=54, color=ACCENT, weight=BOLD).scale_to_fit_width(8.0).to_edge(UP, buff=1.4)

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
        ).shift(DOWN * 1.4)

        x_lbl = Text("Days", font_size=32, color=SUBTEXT).next_to(axes, DOWN, buff=0.35)
        y_lbl = Text("Memory %", font_size=32, color=SUBTEXT).next_to(axes, LEFT, buff=0.25).rotate(PI / 2)

        forget_curve = axes.plot(
            lambda x: 100 * (2.71828 ** (-0.65 * x)),
            x_range=[0, 7],
            color=NEGATIVE,
            stroke_width=6,
        )
        shade = axes.get_area(forget_curve, x_range=[0, 7], color=NEGATIVE, opacity=0.13)

        day0_dot = Dot(axes.c2p(0, 100), color=WHITE, radius=0.12)
        day7_dot = Dot(axes.c2p(7, 9), color=NEGATIVE, radius=0.12)

        day0_lbl = Text("100%", font_size=30, color=WHITE).next_to(day0_dot, UP, buff=0.15)
        day7_lbl = Text("~9%", font_size=30, color=NEGATIVE).next_to(day7_dot, RIGHT, buff=0.15)

        self.play(FadeIn(sec2_title, shift=DOWN * 0.2), run_time=0.7)
        self.play(Create(axes), Write(x_lbl), Write(y_lbl), run_time=1.1)
        self.play(Create(forget_curve), FadeIn(shade), run_time=1.8)
        self.play(FadeIn(day0_dot), Write(day0_lbl), run_time=0.5)
        self.play(FadeIn(day7_dot), Write(day7_lbl), run_time=0.5)
        self.wait(1.8)
        self.play(FadeOut(VGroup(sec2_title, axes, forget_curve, shade, x_lbl, y_lbl, day0_dot, day7_dot, day0_lbl, day7_lbl)), run_time=0.7)

        # ════════════════════════════════════════════════════════════════════
        # SCENE 3: SPACED REPETITION FIX
        # ════════════════════════════════════════════════════════════════════
        sec3_title = Text("The Fix: Spaced Repetition", font_size=50, color=ACCENT, weight=BOLD).scale_to_fit_width(8.0).to_edge(UP, buff=1.4)

        insight_box = Rectangle(width=8.3, height=1.1, color=ACCENT, fill_opacity=0.08, stroke_width=1.5).shift(UP * 1.5)
        insight_text = Text("Review at the right time\n= memory sticks forever", font_size=40, color=WHITE, line_spacing=1.2).scale_to_fit_width(7.6).shift(UP * 1.5)

        steps = VGroup(
            Text("Day 1   — Learn it",          font_size=42, color=WHITE),
            Text("Day 3   — Quick review",       font_size=42, color=WHITE),
            Text("Day 7   — Recall test",        font_size=42, color=WHITE),
            Text("Day 14  — Mastery check",      font_size=42, color=WHITE),
            Text("Day 30  — Long-term memory!", font_size=42, color=POSITIVE, weight=BOLD),
        ).arrange(DOWN, buff=0.52, aligned_edge=LEFT).scale_to_fit_width(8.0).shift(DOWN * 1.5)

        self.play(FadeIn(sec3_title, shift=DOWN * 0.2), run_time=0.7)
        self.play(Create(insight_box), FadeIn(insight_text), run_time=0.8)
        for step in steps:
            self.play(FadeIn(step, shift=RIGHT * 0.25), run_time=0.38)
        self.wait(1.8)
        self.play(FadeOut(VGroup(sec3_title, insight_box, insight_text, steps)), run_time=0.7)

        # ════════════════════════════════════════════════════════════════════
        # SCENE 4: CTA
        # ════════════════════════════════════════════════════════════════════
        cta_main = Text("Build real\nmemory in math.", font_size=84, color=WHITE, weight=BOLD, line_spacing=1.2).scale_to_fit_width(7.8).shift(UP * 1.2)

        cta_sub = Text("Try Cuemath →", font_size=60, color=ACCENT, weight=BOLD).next_to(cta_main, DOWN, buff=0.9)

        badge = Rectangle(width=5.5, height=1.0, color=ACCENT, fill_opacity=0.15, stroke_width=2).next_to(cta_main, DOWN, buff=0.65)

        self.play(FadeIn(cta_main, shift=UP * 0.4), run_time=1.0)
        self.play(Create(badge), Write(cta_sub), run_time=1.0)
        self.wait(2.5)
        self.play(FadeOut(VGroup(cta_main, cta_sub, badge, brand)), run_time=0.8)