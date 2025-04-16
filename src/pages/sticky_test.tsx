export default function StickyTest() {
  return (
    <div style={{ height: "2000px", background: "#eee" }}>
      <div
        style={{
          position: "sticky",
          top: 0,
          background: "yellow",
          zIndex: 10,
        }}
      >
        I am sticky!
      </div>
      <div style={{ height: "1800px" }}>Scroll me</div>
    </div>
  );
}
