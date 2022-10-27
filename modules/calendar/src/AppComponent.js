import React, { useState, useEffect, Fragment} from 'react';
import Calendar from 'react-calendar';
import { Event } from './Event.js';
import './css/styles.scss';
import moment from 'moment';

export const AppComponent = props => {
	//LIFERAY INFOS
	const [companyId,setCompanyId] = useState(Liferay.ThemeDisplay.getCompanyId())
	//LOADING INDICATOR
	const [calendarLoaded,setCalendarLoaded] = useState(false)
	const [eventsCurrentMonthLoaded,setEventsCurrentMonthLoaded] = useState(false)
	//CALENDAR INFOS STORAGE
	const [calendarsIds,setCalendarsIds] = useState([]);
	const [currentMonthEvents,setCurrentMonthEvents] = useState([]);
	//DISPLAY EVENTS
	const eventsPerPage = 5;
	const [displayConditions,setDisplayConditions] = useState(
		{
			start:moment().startOf("day").valueOf(),
			end:moment().startOf("day").add(1,"month").endOf("day").valueOf()
		}
	);
	const [selectedDate, setSelectedDate] = useState(new Date);
	const [eventListLabel,setEventListLabel] = useState("Événements à venir")
	const [activePage,setActivePage] = useState(0)

	//CHANGE HANDLER
	const selectDate = date => {
		setActivePage(0)
		setEventListLabel("Événements du "+moment(date).format("DD/MM"))
		setDisplayConditions({
			start:moment(date).startOf("day").valueOf(),
			end:moment(date).endOf("day").valueOf()
		})
		if(!moment(selectedDate).isSame(moment(date), 'month')){
			loadCurrentMonthEvents({
				start:moment(date).startOf("month").subtract(7,"day").startOf("day").valueOf(),
				end:moment(date).endOf("month").add(7,"day").endOf("day").valueOf()
			});
		}
		setSelectedDate(date)
	}
	const onActiveStartDateChange = ({ action, activeStartDate, value, view }) => {//WHEN NAVIGATES WITH ARROW
		if(view == "month"){
			setActivePage(0)
			setEventListLabel("Événements : " + moment(activeStartDate).format("MMMM"))
			setDisplayConditions({
				start:moment(activeStartDate).startOf("month").valueOf(),
				end:moment(activeStartDate).endOf("month").valueOf()
			})
			loadCurrentMonthEvents({
				start:moment(activeStartDate).startOf("month").subtract(7,"day").startOf("day").valueOf(),
				end:moment(activeStartDate).endOf("month").add(7,"day").endOf("day").valueOf()
			});
		}
	}
	const navigateToPage = index => {
		setActivePage(index)
	}

	//LOADER
	const loadCalendars = () => {
		Liferay.Service(
            '/calendar.calendar/search',
            {
                companyId: companyId,//37079,
                groupIds: null,
                calendarResourceIds: null,
                name: '',
                description: '',
                andOperator: true,
                start: -1,
                end: -1,
                orderByComparator: null
            },
            calendars => {
				setDisplayConditions({//HERE WE LOAD EVENTS FOR THE NEXT 30 DAYS
					start:moment().startOf("day").valueOf(),
					end:moment().startOf("day").add(1,"month").endOf("day").valueOf()
				});
				let calsId = calendars.map(calendar=>{return(Number(calendar.calendarId))})
				loadCurrentCalsMonthEvents({
					calsId:calsId,
					start:moment().startOf("month").subtract(7,"day").startOf("day").valueOf(),
					end:moment().endOf("month").add(7,"day").endOf("day").valueOf()
				});
				setCalendarsIds(calsId)
				setCalendarLoaded(true);
            }
        );
	}
	const loadCurrentMonthEvents = ({start,end}) => {//USED FOR EVENTS NOTIFICATION IN CALENDAR VIEW
		loadCurrentCalsMonthEvents({calsId:calendarsIds,start:start,end:end})
	}
	const loadCurrentCalsMonthEvents = ({calsId,start,end}) => {//USED FOR EVENTS NOTIFICATION IN CALENDAR VIEW
		Liferay.Service(
			"/calendar.calendarbooking/search",
			{
				companyId: companyId,
				groupIds: null,
				calendarIds:calsId,
				recurring:true,
				startTime:start,
				endTime:end,
				parentCalendarBookingId: -1,
				displayTimeZone: null,
				start: -1,
				end: -1,
				calendarResourceIds: null,
				keywords: "",
				statuses: null,
				orderByComparator: null
			},
			evts => {
				setCurrentMonthEvents((evts ? evts.sort((a,b)=>parseInt(a.startTime) - parseInt(b.startTime)) : []))
				setEventsCurrentMonthLoaded(true)
			}
		);
	}
	//CONTENT GETTER
	const getEventsRows = displayed => {
		if(displayed.length == 0){//NO EVENTS TO DISPLAY
			return(
				<p style={{textAlign:"center"}}>Aucun événement</p>
			)
		}else{
			if(displayed.length <= eventsPerPage){//PAGINATION NOT NEEDED
				return(
					<Fragment>
						{displayed.map(e => {
							return(
								<Event key={e.uuid+e.startTime} event={e}/>
							)
						})}
					</Fragment>
				)
			}else{//PAGINATION NEEDED
				let iStart = activePage * eventsPerPage;
				let iEnd = iStart + eventsPerPage;
				return (
					<Fragment>
						{displayed.slice(iStart,iEnd).map(e => {
							return(
								<Event key={e.uuid+e.startTime} event={e}/>
							)
						})}
					</Fragment>
				)
			}
		}
	}
	const getEventsPagination = displayed => {
		let nbEvents = displayed.length;
		if(nbEvents <= eventsPerPage){
			return "";
		}else{
			let nPages = nbEvents / eventsPerPage;
			const pages = [];
			for (let i = 0; i < nPages; i++) {pages.push(i)}
			return(
				<div className="pagination-rail">
					{pages.map(i=>
						<div onClick={()=>navigateToPage(i)} className={"pagination-item"+(activePage == i ? " active" :"")}>{i+1}</div>
					)}
				</div>	
			)
		}
	}

	useEffect(()=>{
		//componentDidMount
		loadCalendars();
	},[])

	if(eventsCurrentMonthLoaded){
		console.log(props.configuration.portletInstance.themecolor);
		let displayed = currentMonthEvents.filter(e=>{return moment(parseInt(e.startTime)).isBetween(displayConditions.start,displayConditions.end)});
		return(
			<React.StrictMode>
				<div className={"brn-calendar brn-" + props.configuration.portletInstance.themecolor}>
					<Calendar
						tileClassName={({ date, view }) => {
							if(currentMonthEvents.find(e=>moment(new Date(parseInt(e.startTime))).format("DD-MM-YYYY") === moment(date).format("DD-MM-YYYY"))){
								return  'event-this-day'
							}
						}}
						onChange={selectDate}
						onActiveStartDateChange={onActiveStartDateChange}
						value={selectedDate}
					/>
					<h4>{eventListLabel} <span className="nb-events">({displayed.length})</span></h4>
					{getEventsPagination(displayed)}
					{getEventsRows(displayed)}
				</div>
			</React.StrictMode>
		)
	}else{
		return(
			<p style={{textAlign:"center"}}>Chargement des événements ...</p>
		)
	}
}