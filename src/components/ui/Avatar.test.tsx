import { render, screen } from "@testing-library/react";
import { Avatar } from "./Avatar";

describe("Avatar", () => {
  it("renders initials when no image is provided", () => {
    render(<Avatar name="John Doe" />);

    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("renders the image when provided", () => {
    render(<Avatar name="Jane Doe" image="/avatar.png" />);

    const img = screen.getByRole("img", { name: /jane doe/i });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", expect.stringContaining("/avatar.png"));
  });
});
