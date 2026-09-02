import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StarRating from "./StarRating";

describe("StarRating", () => {
  it("valueに応じて★とその他を正しい数だけ表示する", () => {
    render(<StarRating value={3} onChange={vi.fn()} />);

    const stars = screen.getAllByRole("radio");
    expect(stars).toHaveLength(5);
    expect(stars.map((star) => star.textContent)).toEqual(["★", "★", "★", "☆", "☆"]);
  });

  it("選択中の星のみaria-checkedがtrueになる", () => {
    render(<StarRating value={2} onChange={vi.fn()} />);

    const stars = screen.getAllByRole("radio");
    expect(stars[0]).toHaveAttribute("aria-checked", "false");
    expect(stars[1]).toHaveAttribute("aria-checked", "true");
    expect(stars[2]).toHaveAttribute("aria-checked", "false");
  });

  it("星をクリックするとその星の値でonChangeが呼ばれる", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<StarRating value={3} onChange={handleChange} />);

    await user.click(screen.getByRole("radio", { name: "理解度5" }));

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(5);
  });

  it("value=0のとき全て☆で表示される", () => {
    render(<StarRating value={0} onChange={vi.fn()} />);

    const stars = screen.getAllByRole("radio");
    expect(stars.map((star) => star.textContent)).toEqual(["☆", "☆", "☆", "☆", "☆"]);
  });
});
