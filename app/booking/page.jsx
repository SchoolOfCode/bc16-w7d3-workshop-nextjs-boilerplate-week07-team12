"use client";
import React from "react";
import "./page.css";
import Form from "../../components/form/Form.jsx";

const formFields = [
  {
    id: "fname",
    name: "",
    type: "text",
    placeholder: "",
    label: "First Name",
    update: "onChange",
    validations: {
      required: false,
      pattern: (value) => value.length <= 20,
      invalidMessage: "The first name can't be over 20 characters long",
    }
  },
  {
    id: "lname",
    name: "",
    type: "text",
    placeholder: "",
    label: "Last Name",
    update: "onChange",
    validations: {
      required: false,
      pattern: (value) => value.length <= 20,
      invalidMessage: "The last name can't be over 20 characters long",
    }
  },
  {
    id: "postcode",
    name: "",
    type: "text",
    placeholder: "",
    label: "Postcode",
    update: "onBlur",
    validations: {
      required: false,
      pattern: async (value) => {
        const response = await fetch(
          `https://api.postcodes.io/postcodes/${value}/validate`
        );
        const { result } = await response.json();
        if (result === false) {
          return false;
        }
        return result;
      },
      invalidMessage: "The post code must be a valid UK postcode",
    }
  },
  {
    id: "address",
    name: "",
    type: "text",
    placeholder: "",
    label: "Address",
    update: "onChange",
    validations: {
      required: false,
      pattern: "",
      invalidMessage: "",
    }
  },
  {
    id: "phone",
    name: "",
    type: "text",
    placeholder: "",
    label: "Phone Number",
    update: "onChange",
    validations: {
      required: false,
      pattern: (value) => {
        const numWithoutSpaces = value.replace(/\s+/g, "");
        return (
          numWithoutSpaces.length === 11 && /^\d+$/.test(numWithoutSpaces)
        );
      },
      invalidMessage: "The phone number must be 11 digits and not contain country codes",
    }
  },
  {
    id: "email",
    name: "",
    type: "email",
    placeholder: "",
    label: "Email",
    update: "onChange",
    validations: {
      required: false,
      pattern: (value) =>
      /\w+@\w+\.\w+/.test(value),
      invalidMessage: "Please input a valid email address"
    }
  },
];

// PAGE COMPONENT
const Booking = () => {
  return (
    <main className="booking__content">
      <section className="booking__banner">Design Booking</section>
      <Form formData={formFields} />
    </main>
  );
};

export default Booking;
