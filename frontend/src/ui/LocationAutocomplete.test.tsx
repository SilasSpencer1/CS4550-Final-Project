import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LocationAutocomplete, { type LocationValue } from "./LocationAutocomplete";
import * as geocode from "../api/geocode";

vi.mock("../api/geocode", () => ({
  searchAddress: vi.fn(),
}));
const mocked = geocode as unknown as { searchAddress: ReturnType<typeof vi.fn> };

function renderHarness(initial: LocationValue = { address: "", city: "", lat: null, lng: null }) {
  const onChange = vi.fn();
  const utils = render(
    <LocationAutocomplete value={initial} onChange={onChange} />
  );
  return { ...utils, onChange };
}

describe("LocationAutocomplete", () => {
  beforeEach(() => {
    mocked.searchAddress.mockReset();
  });

  it("does not search for inputs under 3 characters", async () => {
    const user = userEvent.setup();
    renderHarness();
    const input = screen.getByRole("textbox");
    await user.type(input, "ab");
    expect(mocked.searchAddress).not.toHaveBeenCalled();
  });

  it("renders dropdown after 3+ chars and a debounce", async () => {
    mocked.searchAddress.mockResolvedValueOnce([
      {
        placeId: "1",
        displayName: "Boston, Suffolk County, Massachusetts, United States",
        lat: 42.36,
        lng: -71.06,
        city: "Boston",
        state: "Massachusetts",
      },
    ]);
    const user = userEvent.setup();
    renderHarness();
    await user.type(screen.getByRole("textbox"), "Bos");
    await waitFor(() =>
      expect(
        screen.getByText(/Boston, Suffolk County/)
      ).toBeInTheDocument()
    );
    expect(mocked.searchAddress).toHaveBeenCalledWith("Bos");
  });

  it("calls onChange with lat/lng when a result is picked", async () => {
    mocked.searchAddress.mockResolvedValueOnce([
      {
        placeId: "9",
        displayName: "Fenway Park, Boston",
        lat: 42.3467,
        lng: -71.0972,
        addressLine: "4 Yawkey Way",
        city: "Boston",
        state: "Massachusetts",
      },
    ]);
    const user = userEvent.setup();
    const { onChange } = renderHarness();
    await user.type(screen.getByRole("textbox"), "Fenway");
    await waitFor(() =>
      expect(screen.getByText(/Fenway Park/)).toBeInTheDocument()
    );
    fireEvent.click(screen.getByText(/Fenway Park/));
    expect(onChange).toHaveBeenCalled();
    const callArg = onChange.mock.calls.at(-1)![0];
    expect(callArg.lat).toBeCloseTo(42.3467, 3);
    expect(callArg.lng).toBeCloseTo(-71.0972, 3);
    expect(callArg.city).toBe("Boston");
    expect(callArg.state).toBe("Massachusetts");
  });

  it("shows 'verified' once lat/lng is set", async () => {
    renderHarness({
      address: "4 Yawkey Way",
      city: "Boston",
      lat: 42.3467,
      lng: -71.0972,
      displayName: "Fenway Park, Boston",
    });
    expect(screen.getByText(/verified/)).toBeInTheDocument();
  });

  it("clears lat/lng when the user edits the input after selection", async () => {
    const user = userEvent.setup();
    const { onChange } = renderHarness({
      address: "original",
      city: "Boston",
      lat: 42.36,
      lng: -71.06,
      displayName: "Boston",
    });
    const input = screen.getByRole("textbox");
    await user.type(input, "X");
    // First onChange call should have cleared the coordinates
    expect(onChange).toHaveBeenCalled();
    const callArg = onChange.mock.calls[0][0];
    expect(callArg.lat).toBeNull();
    expect(callArg.lng).toBeNull();
  });

  it("shows OSM attribution in the dropdown", async () => {
    mocked.searchAddress.mockResolvedValueOnce([
      {
        placeId: "1",
        displayName: "Somerville, Massachusetts",
        lat: 42.39,
        lng: -71.1,
        city: "Somerville",
      },
    ]);
    const user = userEvent.setup();
    renderHarness();
    await user.type(screen.getByRole("textbox"), "Som");
    await waitFor(() =>
      expect(screen.getByText(/openstreetmap contributors/i)).toBeInTheDocument()
    );
  });
});
