import React, { useRef, useEffect } from "react";
import "./helpers/Globals";
import "p5/lib/addons/p5.sound";
import * as p5 from "p5";
import { Midi } from '@tonejs/midi'
import PlayIcon from './functions/PlayIcon.js';

import audio from "../audio/patterns-no-5.ogg";
import midi from "../audio/patterns-no-5.mid";

const P5SketchWithAudio = () => {
    const sketchRef = useRef();

    const Sketch = p => {

        p.canvas = null;

        p.canvasWidth = window.innerWidth;

        p.canvasHeight = window.innerHeight;

        p.audioLoaded = false;

        p.player = null;

        p.PPQ = 3840 * 4;

        p.loadMidi = () => {
            Midi.fromUrl(midi).then(
                function(result) {
                    console.log(result);
                    const noteSet1 = result.tracks[5].notes; // Thor 3 - Mound of Wires
                    p.scheduleCueSet(noteSet1, 'executeCueSet1');
                    p.audioLoaded = true;
                    document.getElementById("loader").classList.add("loading--complete");
                    document.getElementById("play-icon").classList.remove("fade-out");
                }
            );
            
        }

        p.preload = () => {
            p.song = p.loadSound(audio, p.loadMidi);
            p.song.onended(p.logCredits);
        }

        p.scheduleCueSet = (noteSet, callbackName, poly = false)  => {
            let lastTicks = -1,
                currentCue = 1;
            for (let i = 0; i < noteSet.length; i++) {
                const note = noteSet[i],
                    { ticks, time } = note;
                if(ticks !== lastTicks || poly){
                    note.currentCue = currentCue;
                    p.song.addCue(time, p[callbackName], note);
                    lastTicks = ticks;
                    currentCue++;
                }
            }
        } 

        p.gridDivisors = [8, 16, 32, 64, 128];

        p.gridDivisor = 16;

        p.gridCells = [];

        p.cellSize = 0;

        p.createGrid = () => {
            p.gridCells = [];
            p.gridDivisor = p.random(p.gridDivisors);
            p.cellSize = p.width / p.gridDivisor;
            for (let x = 0; x < p.width; x = x + p.cellSize) {
                for (let y = 0; y < p.height; y = y + p.cellSize) {
                    p.gridCells.push(
                        {
                            x: x,
                            y: y,
                        }
                    );
                } 
            } 
        }

        p.setup = () => {
            p.canvas = p.createCanvas(p.canvasWidth, p.canvasHeight);
            p.colorMode(p.HSB);
            p.background(0);
            p.noFill();
            p.stroke(255);
            p.noLoop();
        }

        p.draw = () => {
            if(p.audioLoaded && p.song.isPlaying()){

            }
        }

        p.executeCueSet1 = (note) => {
            p.createGrid();
            p.background(0);
            for (let i = 0; i < p.gridCells.length; i++) {
                p.stroke(p.random(0, 360), 100, 100);
                const cell = p.gridCells[i], 
                    {x, y} = cell, 
                    quarterCell = p.cellSize / 4;
                if(Math.random() > 0.5){
                    p.line(x, y, x + p.cellSize, y + p.cellSize);
                    p.beginShape();
                    p.vertex(x, y);
                    p.bezierVertex(
                        x + quarterCell * 3, 
                        y + quarterCell * 1, 
                        x + quarterCell * 1, 
                        y + quarterCell * 3, 
                        x + p.cellSize, 
                        y + p.cellSize
                    );
                    p.endShape();
                    p.beginShape();
                    p.vertex(x, y);
                    p.bezierVertex(
                        x + quarterCell * 1, 
                        y + quarterCell * 3, 
                        x + quarterCell * 3, 
                        y + quarterCell * 1,
                        x + p.cellSize, 
                        y + p.cellSize
                    );
                    p.endShape();
                }
                else {
                    p.line(x + p.cellSize, y, x, y + p.cellSize);
                    p.beginShape();
                    p.vertex(x + p.cellSize, y);
                    p.bezierVertex(
                        x + quarterCell * 1, 
                        y + quarterCell * 1, 
                        x + quarterCell * 3, 
                        y + quarterCell * 3, 
                        x, 
                        y + p.cellSize
                    );
                    p.endShape();
                    p.beginShape();
                    p.vertex(x + p.cellSize, y);
                    p.bezierVertex(
                        x + quarterCell * 3, 
                        y + quarterCell * 3, 
                        x + quarterCell * 1, 
                        y + quarterCell * 1,
                        x, 
                        y + p.cellSize
                    );
                    p.endShape();
                }
            }
        }

        p.mousePressed = () => {
            if(p.audioLoaded){
                if (p.song.isPlaying()) {
                    p.song.pause();
                } else {
                    if (parseInt(p.song.currentTime()) >= parseInt(p.song.buffer.duration)) {
                        p.reset();
                    }
                    document.getElementById("play-icon").classList.add("fade-out");
                    p.canvas.addClass("fade-in");
                    p.song.play();
                }
            }
        }

        p.creditsLogged = false;

        p.logCredits = () => {
            if (
                !p.creditsLogged &&
                parseInt(p.song.currentTime()) >= parseInt(p.song.buffer.duration)
            ) {
                p.creditsLogged = true;
                    console.log(
                    "Music By: http://labcat.nz/",
                    "\n",
                    "Animation By: https://github.com/LABCAT/"
                );
                p.song.stop();
            }
        };

        p.reset = () => {

        }

        p.updateCanvasDimensions = () => {
            p.canvasWidth = window.innerWidth;
            p.canvasHeight = window.innerHeight;
            p.canvas = p.resizeCanvas(p.canvasWidth, p.canvasHeight);
        }

        if (window.attachEvent) {
            window.attachEvent(
                'onresize',
                function () {
                    p.updateCanvasDimensions();
                }
            );
        }
        else if (window.addEventListener) {
            window.addEventListener(
                'resize',
                function () {
                    p.updateCanvasDimensions();
                },
                true
            );
        }
        else {
            //The browser does not support Javascript event binding
        }
    };

    useEffect(() => {
        new p5(Sketch, sketchRef.current);
    }, []);

    return (
        <div ref={sketchRef}>
            <PlayIcon />
        </div>
    );
};

export default P5SketchWithAudio;
