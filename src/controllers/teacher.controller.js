import { Teacher } from "../models/teacher.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const CreateTeacher = asyncHandler(async (req, res) => {
  const { teacherName } = req.body;
  if ([teacherName].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "teacher field is required");
  }
  const existedTeacher = await Teacher.findOne({ teacherName });
  if (existedTeacher) {
    throw new ApiError(400, "Teacher already exist");
  }

  const teacher = await Teacher.create({
    teacherName,
  });
  if (!teacher) {
    throw new ApiError(401, "Somethig went wrong creatig teacher");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, teacher, "Teacher added successfully"));
});

const updateTeacher = asyncHandler(async (req, res) => {
  const { teacherName } = req.body;
  const { teacherId } = req.params;
  console.log(teacherName, teacherId);

  if (!teacherName) {
    throw new ApiError(400, "teacher doesnot exist");
  }
  const existTeacher = await Teacher.findById(teacherId);
  if (existTeacher.teacherName === teacherName) {
    return res
      .status(200)
      .json(new ApiResponse(200, existTeacher, "No changes made"));
  }

  const teacher = await Teacher.findByIdAndUpdate(
    teacherId,
    {
      $set: { teacherName },
    },
    { new: true }
  );

  //   const updatedTeacher = await Teacher.findById(teacher);
  return res
    .status(200)
    .json(new ApiResponse(200, teacher, "teacher updated successfully"));
});

const deleteTeacher = asyncHandler(async (req, res) => {
  const { teacherId } = req.params;
  const teacher = await Teacher.findById(teacherId);
  if (!teacher) {
    throw new ApiError(404, "Teacher doesnot exist");
  }
  await teacher.deleteOne();
  return res.status(200).json(new ApiResponse(200, "Teacher deleted success"));
});

const getTeachers = asyncHandler(async (req, res) => {
  const teachers = await Teacher.find();
  if (!teachers) {
    throw new ApiError(404, "Teachers Not Found");
  }
  const teacherNames = teachers.map((teacher) => teacher.teacherName);
  return res
    .status(200)
    .json(
      new ApiResponse(200, teacherNames, "All teacher fetched successfully")
    );
});

export { CreateTeacher, updateTeacher, deleteTeacher, getTeachers };
