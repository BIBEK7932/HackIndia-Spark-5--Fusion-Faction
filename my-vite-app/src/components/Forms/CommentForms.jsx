import { useEffect, useState } from "react";
import './Comment.css';

export default function CommentForms({ addNewComment }) {
    const [formData, setFormData] = useState({ userName: "", remark: "", rating: 5 });
    const [isHateSpeech, setIsHateSpeech] = useState(false);

    const handleChange = (event) => {
        setFormData(prev => ({ ...prev, [event.target.name]: event.target.value }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (isHateSpeech) {
            alert("Your text is hate speech and cannot be submitted.");
            return;
        }

        addNewComment(formData);
        setFormData({ userName: "", remark: "", rating: 5 });
    };

    const checkForHateSpeech = async (textInput) => {
        try {
            const response = await fetch('http://127.0.0.1:5000/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: textInput })
            });

            // Check for HTTP errors
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Received data:', data);

            // Set hate speech flag based on the response
            setIsHateSpeech(data.prediction === "yes");
        } catch (error) {
            console.error('Error:', error);
        }
    };

    useEffect(() => {
        console.log('Remark changed:', formData.remark);
        if (formData.remark) {
            checkForHateSpeech(formData.remark);
        }
    }, [formData.remark]);

    return (
        <div className="comment-form-container">
            <h4 className="comment-form-title">Give a comment</h4>
            <form className="comment-form" onSubmit={handleSubmit}>
                {/* <input
                    type="text"
                    name="userName"
                    id="userName"
                    placeholder="User name"
                    value={formData.userName}
                    onChange={handleChange}
                    required
                    className="comment-form-input"
                /> */}
                <br />
                <br />
                <textarea
                    name="remark"
                    id="remarks"
                    value={formData.remark}
                    placeholder="Enter new remarks"
                    onChange={handleChange}
                    className="comment-form-textarea"
                ></textarea>
                <br />
                {/* <input
                    type="number"
                    name="rating"
                    id="rating"
                    placeholder="Enter rating"
                    value={formData.rating}
                    onChange={handleChange}
                    min={1}
                    max={5}
                    className="comment-form-input"
                /> */}
                <br />
                <button
                    className="comment-form-button"
                    id="bib1"
                    disabled={isHateSpeech}
                >
                    {isHateSpeech ? "Comment Disabled" : "Add Comment"}
                </button>
            </form>
        </div>
    );
}




















// import { useEffect, useState } from "react"
// import './Comment.css'
// export default function CommentForms({addNewComment}) {
//     let [formData, setFormData] = useState({ userName: "", remark: "", rating: 5 })

//     let handleChange = (event) => {
//         setFormData((prev) => { return { ...prev, [event.target.name]: event.target.value } })
//     }

//     let flag = 1
//     let handleSubmit = (event) => {
//        if(flag == 0){
//         document.getElementById('bib1').style.disabled = true
//         alert("Your text is hate speech")
//        }
//         addNewComment(formData)
//         event.preventDefault()
//         setFormData({ userName: "", remark: "", rating: 5 })
//     }
//     useEffect(() => {
       

//         document.getElementById('bib1').addEventListener('click', function(event) {
//             event.preventDefault();
//             var textInput = document.getElementById('remarks').value;
//             console.log(textInput)
//             fetch('http://127.0.0.1:5000/predict', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({text: textInput})
//             })
//             .then(response => response.json())
//             .then(data => {
//             if(data.prediction=="yes")
//             {
              
// flag =0;
//             }
//             else
// flag=1
//             })
//             .catch(error => console.error('Error:', error));
//         });
//       });
    
     
    
//     return (
//         <div className="comment-form-container" onSubmit={handleSubmit}>
//         <h4 className="comment-form-title">Give a comment</h4>
//         <form className="comment-form">
//             <input
//                 type="text"
//                 name="userName"
//                 id="userName"
//                 placeholder="User name"
//                 value={formData.userName}
//                 onChange={handleChange}
//                 required
//                 className="comment-form-input"
//             />
//             <br />
//             <br />
//             <textarea
//                 name="remark"
//                 id="remarks"
//                 value={formData.remark}
//                 placeholder="Enter new remarks"
//                 onChange={handleChange}
//                 className="comment-form-textarea"
//             ></textarea>
//             <br />
//             <input
//                 type="number"
//                 name="rating"
//                 id="rating"
//                 placeholder="Enter rating"
//                 value={formData.rating}
//                 onChange={handleChange}
//                 min={1}
//                 max={5}
//                 className="comment-form-input"
//             />
//             <br />
//             <button className="comment-form-button" id="bib1">Add Comments</button>
//         </form>
//     </div>
//     )
// }