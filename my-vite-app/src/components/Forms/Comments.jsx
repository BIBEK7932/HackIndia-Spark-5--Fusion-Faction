import { useState } from "react"
import CommentForms from "./CommentForms"
import './Comment.css'
export default function Comment(){
let [comments,setComments] = useState([{
    userName: "uid",
    remark: "wow",
    rating: 3
}])

let addNewComment = (comment)=>{
    // console.log(comments)
setComments((prev)=> [...prev, comment])
}
    return(
        <div className="comment-container">
            <div id="img1">
                <img src="https://static.toiimg.com/thumb/msid-111741230,width-1280,height-720,resizemode-4/111741230.jpg" alt="" height={"250px"} width={"350px"}/>
            </div>
            <h2 className="comment-title">All Comments</h2>
            <div className="comment-items">
            {comments.map((d, idx) =>
                <div key={idx} className="comment-item">
                    <span className="comment-remark" >{d.remark}</span>
                    {/* <b><span className={`comment-rating ${d.rating === 5 ? 'green' : ''} ${( d.rating>=2 && d.rating<= 4) ? 'orange' : ''}`} > {d.rating}</span></b>  */}
                    <p className="comment-username">@{d.userName}</p>
                </div>
            )}
            </div>
           
            
            <CommentForms addNewComment={addNewComment}/>
        </div>
        
    )
}