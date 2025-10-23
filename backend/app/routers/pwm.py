from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
import RPi.GPIO as GPIO

router = APIRouter(tags=["pwm"])

# Initialize GPIO for PWM
GPIO.setmode(GPIO.BCM)

class PWMRequest(BaseModel):
    pin: int = Field(..., description="GPIO pin number (BCM mode)", ge=0, le=27)
    frequency: float = Field(default=50.0, description="PWM frequency in Hz", gt=0, le=1000)
    duty_cycle: float = Field(..., description="Duty cycle (0-100)", ge=0, le=100)

class PWMResponse(BaseModel):
    pin: int
    frequency: float
    duty_cycle: float
    status: str

# Store active PWM instances
pwm_channels = {}

@router.post("/pwm/start", response_model=PWMResponse)
async def start_pwm(request: PWMRequest):
    """Start PWM on specified pin with given frequency and duty cycle"""
    try:
        # Clean up if pin was used before
        if request.pin in pwm_channels:
            pwm_channels[request.pin].stop()
            GPIO.cleanup(request.pin)

        # Setup PWM
        GPIO.setup(request.pin, GPIO.OUT)
        pwm = GPIO.PWM(request.pin, request.frequency)
        pwm.start(request.duty_cycle)
        pwm_channels[request.pin] = pwm

        return PWMResponse(
            pin=request.pin,
            frequency=request.frequency,
            duty_cycle=request.duty_cycle,
            status="running"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/pwm/update", response_model=PWMResponse)
async def update_pwm(request: PWMRequest):
    """Update frequency and/or duty cycle of running PWM"""
    if request.pin not in pwm_channels:
        raise HTTPException(status_code=404, detail=f"No PWM running on pin {request.pin}")
    
    try:
        pwm = pwm_channels[request.pin]
        pwm.ChangeFrequency(request.frequency)
        pwm.ChangeDutyCycle(request.duty_cycle)
        
        return PWMResponse(
            pin=request.pin,
            frequency=request.frequency,
            duty_cycle=request.duty_cycle,
            status="updated"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/pwm/stop/{pin}")
async def stop_pwm(pin: int):
    """Stop PWM on specified pin"""
    if pin not in pwm_channels:
        raise HTTPException(status_code=404, detail=f"No PWM running on pin {pin}")
    
    try:
        pwm_channels[pin].stop()
        GPIO.cleanup(pin)
        del pwm_channels[pin]
        return {"status": "stopped", "pin": pin}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Cleanup GPIO on shutdown
@router.on_event("shutdown")
async def cleanup():
    for pin in pwm_channels:
        pwm_channels[pin].stop()
    GPIO.cleanup()