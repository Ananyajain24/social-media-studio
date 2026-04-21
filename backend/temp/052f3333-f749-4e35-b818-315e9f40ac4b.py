from manim import *
BG="#1A1A2E"; ACCENT="#FFCC00"; WHITE="#FFFFFF"; SUBTEXT="#A8B2C8"; POSITIVE="#4BFF8C"; NEGATIVE="#FF4B4B"; BLUE_HL="#4B9EFF"
config.pixel_width=1080; config.pixel_height=1920; config.frame_width=9; config.frame_height=16; config.frame_rate=30


class MathReel(Scene):
    """
    TOPIC: The Forgetting Curve & Spaced Repetition
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
        hook_line1 = Text("Your child aced", font_size=72, color=WHITE, weight=BOLD)
        hook_line2 = Text("the test...", font_size=72, color=WHITE, weight=BOLD)
        hook_line3 = Text("then forgot", font_size=80, color=NEGATIVE, weight=BOLD)
        hook_line4 = Text("everything.", font_size=80, color=NEGATIVE, weight=BOLD)

        hook = VGroup(hook_line1, hook_line2, hook_line3, hook_line4)\
            .arrange(DOWN, buff=0.35, aligned_edge=LEFT)\
            .scale_to_fit_width(7.8)\
            .move_to(ORIGIN + UP * 0.5)

        self.play(FadeIn(hook_line1, shift=UP * 0.3), run_time=0.7)
        self.play(FadeIn(hook_line2, shift=UP * 0.3), run_time=0.6)
        self.wait(0.4)
        self.play(FadeIn(hook_line3, shift=UP * 0.3), run_time=0.6)
        self.play(FadeIn(hook_line4, shift=UP * 0.3), run_time=0.6)
        self.wait(1.8)
        self.play(FadeOut(hook), run_time=0.6)

        # ════════════════════════════════════════════════════════════════════
        # SCENE 2: THE FORGETTING CURVE
        # ════════════════════════════════════════════════════════════════════
        sec2_title = Text("The Forgetting Curve", font_size=54, color=ACCENT, weight=BOLD)\
            .scale_to_fit_width(8.0)\
            .to_edge(UP, buff=1.4)

        subtitle = Text("Memory drops fast without review", font_size=36, color=SUBTEXT)\
            .scale_to_fit_width(7.8)\
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
                "decimal_number_config": {"color": SUBTEXT, "num_decimal_places": 0},
            },
            tips=False,
        ).shift(DOWN * 1.8)

        x_lbl = Text("Days", font_size=32, color=SUBTEXT).next_to(axes, DOWN, buff=0.35)
        y_lbl = Text("Memory %", font_size=32, color=SUBTEXT)\
            .next_to(axes, LEFT, buff=0.25).rotate(PI / 2)

        curve = axes.plot(
            lambda x: 100 * (2.71828 ** (-0.6 * x)),
            x_range=[0, 7],
            color=NEGATIVE,
            stroke_width=6,
        )
        shade = axes.get_area(curve, x_range=[0, 7], color=NEGATIVE, opacity=0.13)

        # annotation dot & label at day 1
        dot_d1 = Dot(axes.c2p(1, 100 * (2.71828 ** (-0.6 * 1))), color=WHITE, radius=0.10)
        lbl_d1 = Text("~55%\nDay 1", font_size=28, color=WHITE)\
            .next_to(dot_d1, UR, buff=0.15)\
            .scale_to_fit_width(1.4)

        dot_d7 = Dot(axes.c2p(7, 100 * (2.71828 ** (-0.6 * 7))), color=NEGATIVE, radius=0.10)
        lbl_d7 = Text("~2%\nDay 7", font_size=28, color=NEGATIVE)\
            .next_to(dot_d7, UR, buff=0.15)\
            .scale_to_fit_width(1.4)

        self.play(FadeIn(sec2_title, shift=DOWN * 0.2), FadeIn(subtitle), run_time=0.8)
        self.play(Create(axes), Write(x_lbl), Write(y_lbl), run_time=1.2)
        self.play(Create(curve), FadeIn(shade), run_time=1.8)
        self.play(FadeIn(dot_d1), FadeIn(lbl_d1), run_time=0.5)
        self.play(FadeIn(dot_d7), FadeIn(lbl_d7), run_time=0.5)
        self.wait(1.8)

        scene2_group = VGroup(sec2_title, subtitle, axes, curve, shade,
                              x_lbl, y_lbl, dot_d1, lbl_d1, dot_d7, lbl_d7)
        self.play(FadeOut(scene2_group), run_time=0.7)

        # ════════════════════════════════════════════════════════════════════
        # SCENE 3: SPACED REPETITION — THE FIX
        # ════════════════════════════════════════════════════════════════════
        sec3_title = Text("Spaced Repetition", font_size=60, color=ACCENT, weight=BOLD)\
            .scale_to_fit_width(8.0)\
            .to_edge(UP, buff=1.4)

        sec3_sub = Text("Review just before you forget", font_size=38, color=SUBTEXT)\
            .scale_to_fit_width(7.8)\
            .next_to(sec3_title, DOWN, buff=0.28)

        steps = VGroup(
            Text("Day 1    Learn the concept", font_size=42, color=WHITE),
            Text("Day 3    Quick 5-min review", font_size=42, color=WHITE),
            Text("Day 7    Short recall test",  font_size=42, color=WHITE),
            Text("Day 14  Lock it in for good", font_size=42, color=POSITIVE),
        ).arrange(DOWN, buff=0.55, aligned_edge=LEFT)\
         .scale_to_fit_width(8.2)\
         .shift(DOWN * 0.55)

        # small arrow indicators
        arrows = VGroup(*[
            Arrow(
                start=step.get_left() + LEFT * 0.5,
                end=step.get_left(),
                color=ACCENT,
                buff=0.05,
                stroke_width=3,
                max_tip_length_to_length_ratio=0.3,
            )
            for step in steps
        ])

        self.play(FadeIn(sec3_title, shift=DOWN * 0.2), FadeIn(sec3_sub), run_time=0.8)
        for i, (step, arrow) in enumerate(zip(steps, arrows)):
            self.play(
                GrowArrow(arrow),
                FadeIn(step, shift=RIGHT * 0.3),
                run_time=0.5,
            )
        self.wait(2.0)

        # highlight the result
        result_box = SurroundingRectangle(steps[3], color=POSITIVE, buff=0.15, stroke_width=3)
        self.play(Create(result_box), run_time=0.6)
        self.wait(1.2)

        scene3_group = VGroup(sec3_title, sec3_sub, steps, arrows, result_box)
        self.play(FadeOut(scene3_group), run_time=0.7)

        # ════════════════════════════════════════════════════════════════════
        # SCENE 4: CTA
        # ════════════════════════════════════════════════════════════════════
        cta_top = Text("Build real memory.", font_size=82, color=WHITE, weight=BOLD)\
            .scale_to_fit_width(7.8)
        cta_mid = Text("Not just test scores.", font_size=72, color=WHITE, weight=BOLD)\
            .scale_to_fit_width(7.8)
        cta_group = VGroup(cta_top, cta_mid)\
            .arrange(DOWN, buff=0.45)\
            .move_to(ORIGIN + UP * 0.8)

        cta_btn = Text("Try Cuemath →", font_size=62, color=ACCENT, weight=BOLD)\
            .scale_to_fit_width(6.5)\
            .next_to(cta_group, DOWN, buff=1.0)

        underline = Line(
            cta_btn.get_left() + DOWN * 0.12,
            cta_btn.get_right() + DOWN * 0.12,
            color=ACCENT,
            stroke_width=3,
        )

        self.play(FadeIn(cta_top, shift=UP * 0.4), run_time=0.8)
        self.play(FadeIn(cta_mid, shift=UP * 0.3), run_time=0.7)
        self.play(Write(cta_btn), run_time=1.0)
        self.play(Create(underline), run_time=0.5)
        self.wait(2.5)
        self.play(FadeOut(VGroup(cta_group, cta_btn, underline, brand)), run_time=0.8)