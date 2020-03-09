import React from 'react'
import axios from 'axios';
class Metric extends React.Component { 

  constructor(props) {
    super(props);
    //init
    this.state = {
      current:[],
      previous: [],
      trend:[],
      flip: "flipInY"
    };

    this.updateTrend();
    this.updateState();
    setInterval(this.updateTrend, 60000*60);  //1h
    setInterval(this.updateState, 60000*10);  //10m 
  }

  updateTrend = () => {
      axios.get(`api/metrics/mobile/history/` + this.props.service + `/` + this.props.customerCategory)
          .then(res => {
              const trend = res.data;
              this.setState({ trend });
      });
  }

  updateState = () => {
      axios.get(`api/metrics/mobile/` + this.props.service + `/` + this.props.customerCategory)
          .then(res => {
              const current = res.data;
              const flip = this.state.flip === "flipInY" ? "flipInX" : "flipInY";
              this.setState({ current });
              this.setState({ flip });
        })
  }

  componentDidUpdate(prevProps, prevState){
    if(prevState.current !== this.state.current) {
      this.setState({previous: Array.from(prevState.current)});
    }
  }

  friendlyStatus = (abbrev) => {
    switch (abbrev)
    {
        case "AVAI":
            return "AVAILABLE";
        case "ALLO":
            return "ALLOCATED";
        case "RESY":
            return "RESERVED TIMELIMIT YES";
        case "RESN":
            return "RESERVED TIMELIMIT NO";
        case "SHOR":
            return "SHORTTIME RESERVED";
        case "QUAR":
            return "QUARANTINE";
        default:
            return "";
    }
   }

    friendlyDisplay = (c) => {
        var p = this.state.trend[c.status] !== null ? this.state.trend[c.status] : 0;
        let diff = ((c.quantity / p) - 1) * 100;
        return <>
            <b>{c.quantity.toLocaleString()}</b><br />
            <small>{p != null ? p.toLocaleString() : 0}<br /><span style={{ color: diff >= 0 ? "green" : "red" }}>{diff.toFixed(2)}%</span></small></>;
    }
/***
  friendlyDisplay = (c) => {
    let p = this.state.previous.find(el => el.status === c.status) || c;
    let diff =  ((c.quantity/p.quantity)-1 ) * 100;
    return <>
    <b>{c.quantity.toLocaleString()}</b><br/>
    <small>{p.quantity.toLocaleString()}<br/><span style={{color: diff >= 0 ? "green" : "red"}}>{diff.toFixed(2)}%</span></small></>;
  }
**/
    render() {
       return <>
       <div className="row mb-3">
            <div className="col-12"><h1>{this.props.title}</h1></div>
       </div>
       <div className="row"> 
               {this.state.current && this.state.current.map((p, index) =>
                   <div className="col-sm-6" key={p.status}>
                            <div className="card bg-transparent border-light mb-3">
                               <div className={`card-body animated ${this.state.flip}`}>
                                <h1 className="card-title">{this.friendlyStatus(p.status)}</h1>
                                <p className="card-text metric">{this.friendlyDisplay(p)}</p>
                               </div>
                           </div>
                       </div>
                   )
               }
        </div></>;   
  }
}

export default Metric;