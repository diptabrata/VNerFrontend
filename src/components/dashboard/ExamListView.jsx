/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useState } from 'react'
import { AuthContext } from '../../Context/AuthProvider'
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonIcon from '@mui/icons-material/Person';
import SubjectIcon from '@mui/icons-material/Subject';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import BlockIcon from '@mui/icons-material/Block';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
import SellIcon from '@mui/icons-material/Sell';
import { useNavigate } from 'react-router-dom';
import useAxios from "../utilities/useAxios";
import { baseURL, UserRoleType } from '../utilities/constants';
import { useEffect } from 'react';
import { ExamLevel } from "../utilities/constants";

import "./ExamListView.scss";

const ExamListView = ({ examTypeDetail }) => {
    let { user, userRole } = useContext(AuthContext);
    const { pageTitle, URL, examType } = examTypeDetail;

    const [ showPopup, setShowPopup ] = useState(false);
    const [ showErr, setShowErr ] = useState(false);
    const [ popupMsg, setPopupMsg ] = useState("Loading...");

    const [ examList, setExamList ] = useState([]);

    let navigate = useNavigate();
    let API = useAxios();
    
    const showLoadingCircle = () =>{
        return true;
    }

    const createExamRedirect = () => {
        setPopupMsg("Redirecting...");
        setShowPopup(true);
        setTimeout(()=>{
            navigate("/exam");
        }, 100);
    }

    const getExamList = async () => {
        setExamList([]);
        let response = await API.get(URL);
        let data = await response.data;
        setExamList(data.exams);
    }
    const redirectToExamEdit = (exam_id) => {
        setPopupMsg("Loading...");
        setShowPopup(true);
        navigate(`/${examType}/${exam_id}/questions`);
    }

    const deleteExam = async (exam_id) => {
        if (window.confirm("Are you sure you want to delete?")){
            setPopupMsg("Deleting...");
            setShowPopup(true);
            let response = await API.delete(`${baseURL}/v2/exam/${exam_id}/delete/`);
            let data = await response.data;

            if (data["task_completed"]){
                document.getElementById(`exam_${exam_id}`).remove();
                setShowPopup(false);
                setPopupMsg("Loading...");
                resetPopup();
            }else{
                setShowErr(true);
                setPopupMsg(data["msg"]);
            }
        }
    }

    const resetPopup = () => {
        setShowErr(false)
        setShowPopup(false);
        setPopupMsg("Loading...");
    }

    const renderExamList = () =>{
        return (
            <div className="exams">
                {examList.map((exam) => (
                    <div className="exam" key={exam.id} id={`exam_${exam.id}`}>
                        <div className="details">
                            <div className="name">{ exam.name }</div>
                            <div className="other">
                                <span>
                                    <CalendarMonthIcon /> {exam.created_at}
                                </span>
                                <span>
                                    <AccessTimeFilledIcon /> {exam.duration} min
                                </span>
                                <span>
                                    <SubjectIcon /> {ExamLevel[exam.level]}
                                </span>
                                <span>
                                    <PersonIcon /> 20
                                </span>
                                <span>
                                    <BlockIcon /> {exam.allowed_attempts}
                                </span>
                                {exam.exam_tag && 
                                    (
                                        <span>
                                            <SellIcon /> {exam.exam_tag}
                                        </span>
                                    )
                                }
                            </div>
                        </div>
                        <div className="action">
                            <button className='edit' onClick={() => { redirectToExamEdit(exam.id) }}><EditIcon /></button>
                            <button className='delete' onClick={() => { deleteExam(exam.id) }}><DeleteIcon /></button>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    const refreshExamList = () => {
        setPopupMsg("Fetching data...");
        setShowPopup(true);
        getExamList();
        setTimeout(()=>{
            setShowPopup(false);
        }, 100);
    }

    useEffect(() => {
        getExamList();
    }, [URL])

    useEffect(() => {
        renderExamList();
    }, [])
    // console.log(user)
    console.log(user.userRole, user?.profile_completed, userRole, UserRoleType.EXAMINER)
    return (
        <>
            { showPopup && 
                <div className='popup_container'>
                    <div className={`popup ${showErr && "error"}`}>
                        { showErr && <button onClick={resetPopup} className='closePopup'> <CloseIcon /> </button> }
                        {(showLoadingCircle() && !showErr) && <div className='loadingCircle'></div>}
                        <div className='loadingText'>
                            { popupMsg }
                            <span></span>
                        </div>
                    </div>
                </div>
            }
            <div className='ELV_container'>
                {(user && user?.profile_completed) && (
                    <div className='ELV_section'>
                        <div className="section_header">
                            <div className="name">{pageTitle["plural"]}</div>
                            <hr />
                            <button onClick={refreshExamList}>
                                <RefreshIcon />
                            </button>
                            <button onClick={createExamRedirect}>
                                <AddIcon />
                            </button>
                        </div>

                        <div className="section_content">
                            {examList.length < 1 ? "No Records found" : renderExamList()}
                        </div>

                    </div>
                )}
                {!user && (
                    <div className='ELV_section'>
                        <div className="section_header">
                            <div className="name">Login to view this page.</div>
                        </div>
                    </div>
                )}
                {(user && !user?.profile_completed) && (
                    <div className='ELV_section'>
                        <div className="section_header">
                            <div className="name">Complete profile to view this page.</div>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}

export default ExamListView