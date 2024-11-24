import React, { useState } from "react";
import { useForm } from "react-hook-form";

export const DrinkTemplate = ({ initialValues = {}, onSubmit }) => {
  const { category = "", name = "", modifiers = "" } = initialValues;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      category,
      name,
      modifiers,
    },
  });

  const submitForm = (data) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(submitForm)}>
      <h1>{category ? `Edit ${category} Drink` : "Add a Drink"}</h1>

      {/* Category Field */}
      <div>
        <label>Category</label>
        <input
          {...register("category", { required: "Category is required" })}
          placeholder="Enter drink category"
        />
        {errors.category && <p>{errors.category.message}</p>}
      </div>

      {/* Name Field */}
      <div>
        <label>Drink Name</label>
        <input
          {...register("name", { required: "Name is required" })}
          placeholder="Enter drink name"
        />
        {errors.name && <p>{errors.name.message}</p>}
      </div>

      {/* Modifiers Field */}
      <div>
        <label>Modifiers</label>
        <textarea
          {...register("modifiers", { required: "Modifiers are required" })}
          placeholder="Enter modifiers (e.g., extra ice, no sugar)"
          rows="4"
          cols="50"
        />
        {errors.modifiers && <p>{errors.modifiers.message}</p>}
      </div>

      <button type="submit">Purchase Drink</button>
    </form>
  );
};
