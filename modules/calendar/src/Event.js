import React, { useState, useEffect} from 'react';
import './css/styles.scss';
import moment from 'moment';
import 'moment/locale/fr';

export const Event = props => {

    const [mStartDate,setMStartDate] = useState(moment(new Date(parseInt(props.event.startTime))));
    const [mEndDate,setMEndDate] = useState(moment(new Date(parseInt(props.event.endTime))));
	//CHANGE HANDLER
	//LOADER
	//CONTENT GETTER
	//LIFECYCLE
	useEffect(()=>{
        moment.locale('fr');
    },[])

	return(
		<div key={props.event.uuid} id={"event"+props.event.uuid} className="brn-event">
            <div className="brn-event-date">
                <span className="dow">{mStartDate.format("ddd")}</span>
                <span className="date">{mStartDate.format("DD/MM")}</span>
            </div>
            <div className="brn-event-time">
                <span className="start-time">{mStartDate.format("HH:mm")}</span>
                -
                <span className="end-time">{mEndDate.format("HH:mm")}</span>
            </div>
            <div className="brn-event-desc">
                {props.event.titleCurrentValue}
            </div>
        </div>
	)
}