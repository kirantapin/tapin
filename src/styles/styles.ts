import styled from "styled-components";

interface GradientProps {
  color: string;
}

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column; /* Stack elements vertically */
  align-items: center; /* Center elements horizontally */
  justify-content: center; /* Center elements vertically */
  width: 100%; /* Full width of the viewport */
  background-color: #ffffff; /* Optional background color */
  gap: 50px; /* Add space between elements */
`;

export const ImageDiv = styled.div`
  width: 100%;
  max-width: 400px;
  height: 500px; /* Set the desired height for the container */
  position: relative; /* Allow child absolute positioning */
  border-radius: 15px; /* Optional: Add rounded corners */
  overflow: hidden; /* Ensure child elements stay within the container */
`;

export const StyledImage = styled.img`
  top: 0; /* Align the image with the top of the container */
  height: 66.67%; /* 2/3 of the container's height */
  width: 100%; /* Ensure the image spans the full width of the container */
  object-fit: cover; /* Scale the image proportionally without distortion */
`;

export const Gradient = styled.div<GradientProps>`
  position: absolute; /* Position the gradient relative to the container */
  top: 33.33%; /* Start at 1/3 of the container's height */
  width: 100%; /* Span the full width of the container */
  height: 66.67%; /* Cover only 1/3 of the container's height */
  background: linear-gradient(to bottom, transparent, black 50%, black 100%);
  z-index: 1; /* Ensure it sits behind any other content */
`;

export const TextOverlay = styled.div`
  position: absolute; /* Position relative to the container */
  bottom: 10px; /* Adjust distance from the bottom of the container */
  width: 100%; /* Span the full width of the container */
  text-align: center; /* Center the text horizontally */
  color: white; /* White text color */
  font-size: 1.2rem; /* Adjust font size */
  font-weight: bold; /* Make the text bold */
  z-index: 2; /* Ensure the text is above the gradient and image */
`;

export const Rectangle = styled.div<GradientProps>`
  position: absolute; /* Position the gradient relative to the container */
  top: 66.67%; /* Start at 1/3 of the container's height */
  width: 100%; /* Span the full width of the container */
  height: 33.33%; /* Cover the remaining 2/3 of the container */
  background-color: ${(props) => props.color}; /* Gradient effect */
  z-index: 0; /* Ensure it sits behind any other content */
`;

export const Banner = styled.div`
  width: 100%; /* Full width of the page */
  background-color: white; /* Banner background color */
  color: black; /* Text color */
  padding: 20px 0; /* Top and bottom padding for the banner */
  text-align: center; /* Center the text */
  font-size: 1.5rem; /* Adjust font size */
  font-weight: bold; /* Make the text bold */
  position: fixed; /* Fixed at the top */
  top: 0; /* Align at the top */
  z-index: 1000; /* Ensure it stays above other elements */
  background: linear-gradient(to bottom, #007bff 80%, rgba(255, 0, 0, 0) 100%);
`;
