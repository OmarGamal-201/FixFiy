import React from "react";
import "./Booking.css";
import { useState } from 'react';
import {Home,User,FileText,CreditCard,Settings,LogOut,Bell,Search,ShieldCheck,UserCircle} from "lucide-react";

const Booking =() => {
    return (
        <div className="booking-page">
          
            <main className="content">
                  
               <h2>Booking</h2>
                <div className="booking-card">
                    
                    <form>
                        <label>Date</label>
                        <div className="date-row">
                            <select>
                                <option>Day</option>
                                <option>1</option>
                                <option>2</option>
                            </select>
                            <select>
                                <option>Month</option>
                                <option>January</option>
                                <option>February</option>
                            </select>
                            <select>
                                <option>Year</option>
                                <option>2024</option>
                                <option>2025</option>
                            </select>
                        </div>
                        <label>Service</label>
                        <select>
                            <option>Service</option>
                            <option>Electricity</option>
                            <option>plumer</option>
                        </select>
                        <label>Payments</label>
                        <select>
                            <option>Payments</option>
                            <option>Fawry</option>
                            <option>Vodavon Cash</option>
                            <option>Visa</option>
                            <option>Instapay</option>
                        </select>
                        <button type="submit">Send</button>
                    </form>
                </div>
               
            </main>
        </div>
    )
}

export default Booking;