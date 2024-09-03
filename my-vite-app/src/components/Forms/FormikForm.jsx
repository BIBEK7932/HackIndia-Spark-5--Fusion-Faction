import { useState } from "react"
import './Comment.css'
import { useFormik } from 'formik';
export default function FormikForms({addNewComment}) {
    // let [formData, setFormData] = useState({ userName: "", remark: "", rating: 5 })
     // let handleChange = (event) => {
    //     setFormData((prev) => { return { ...prev, [event.target.name]: event.target.value } })
    // }

    // let handleSubmit = (event) => {
       
    //     addNewComment(formData)
    //     event.preventDefault()
    //     setFormData({ userName: "", remark: "", rating: 5 })
    // }

    const validate = values => {
        const errors = {};
        if (!values.userName) {
          errors.userName = 'Required';
      }
      
        return errors;
      };


   const formik = useFormik({
     initialValues: {
        userName: "", remark: "", rating: 5 
     },
     validate,
     onSubmit: values => {
       alert(JSON.stringify(values, null, 2));
     },
   });

   
    return (
        <div className="comment-form-container" onSubmit={formik.handleSubmit}>
        <h4 className="comment-form-title">Give a comment</h4>
        <form className="comment-form">
            <input
                type="text"
                name="userName"
                id="userName"
                placeholder="User name"
                value={formik.values.userName}
                onChange={formik.handleChange}
               
                className="comment-form-input"
            />
              {formik.errors.userName ? <div>{formik.errors.userName}</div> : null}
            <br />
            <br />
            <textarea
                name="remark"
                id="remarks"
                value={formik.values.remark}
                placeholder="Enter new remarks"
                onChange={formik.handleChange}
                className="comment-form-textarea"
            ></textarea>
            <br />
            <input
                type="number"
                name="rating"
                id="rating"
                placeholder="Enter rating"
                value={formik.values.rating}
                onChange={formik.handleChange}
                min={1}
                max={5}
                className="comment-form-input"
            />
            <br />
            <button className="comment-form-button" type="submit">Add Comments</button>
        </form>
    </div>
    )
}
