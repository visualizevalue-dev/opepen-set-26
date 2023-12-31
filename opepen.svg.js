export default () => `<svg width="512" height="512" viewBox="0 0 8 8" xmlns="http://www.w3.org/2000/svg">
  <g fill="currentColor">
    <!-- Left Eye -->
    <g transform="translate(2, 2)" id="left-eye">
      <path d="M 1 0
        A 1 1, 0, 1, 1, 0 1
        L 0 0 Z"
      />
    </g>

    <!-- Right Eye -->
    <g transform="translate(4, 2)" id="right-eye">
      <circle r="1" cy="1" cx="1" />
    </g>

    <!-- Mouth -->
    <g transform="translate(2, 4)">
      <path d="M 1 2
        A 1 1, 0, 0, 1, 0 1
        L 0 0
        L 4 0
        L 4 1
        A 1 1, 0, 0, 1, 3 2
        Z"
      />
    </g>
  </g>
</svg>`
