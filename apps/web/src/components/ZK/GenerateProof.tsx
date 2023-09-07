'use client'

import React, { useEffect, useState } from 'react';
import { formatString, sleep } from 'helper'
import { zkproof, getModelWeight } from '../../service/kamui/verify'
import ProcessLoading from '../../components/Loading/ProcessLoading'

export interface GenerateProofProps {
    imgSrc: any
    handleCopyClick: any
    onClose: any
    setProof: any
}


const GenerateProof = ({ imgSrc, handleCopyClick, setProof, onClose }: GenerateProofProps) => {
    const [isCopied, setCopied] = useState(false);
    const [proofToJSON, setProofToJSON] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('')
    const [loadingSecondaryText, setLoadingSecondaryText] = useState(null)
    const [modelWeightList, setModelWeightList] = useState([])
    const [modelWeightId, setModelWeightId] = useState(null)
    const ipfsKey = 'QmedkX5nTPfDZxF5epTXTA4pha61xX3uzVi31EgJdcQ7Jw'

    const handleProcess2GrayScale = async () => {
        return new Promise((resolve, reject) => {
            const canvas = document.getElementById('a') as HTMLCanvasElement;
            const context = canvas.getContext('2d');

            var img = new Image();
            img.src = imgSrc
            img.onload = function () {
                context.filter = 'grayscale(100%)'
                context.drawImage(img, 0, 0, 50, 50);
                const input8Array = Buffer.from(canvas.toDataURL())
                const width = 50;
                const height = 50;
                const outputArray = [];

                for (let y = 0; y < height; y++) {
                    const row = [];
                    for (let x = 0; x < width; x++) {
                        const index = y * width + x;
                        row.push([input8Array[index]]);
                    }
                    outputArray.push(row);
                }
                resolve(outputArray)
            }
        })
    }

    const genProof = async () => {
        setIsLoading(true)
        const grayScaleBuffer = await handleProcess2GrayScale()
        setLoadingText(`Downloading model weight`)
        setLoadingSecondaryText(modelWeightId)
        const modelWeight = await getModelWeight(modelWeightId)
        await sleep(2000)
        setLoadingSecondaryText(null)
        setLoadingText(`Generating Proof`)
        const result = await zkproof(grayScaleBuffer, modelWeight)
        setIsLoading(false)
        setProof(result)
        setProofToJSON(result)
    }

    const handleCopyProof = () => {
        const textToCopy = JSON.stringify(proofToJSON)
        navigator.clipboard.writeText(textToCopy as string).then(() => {
            setCopied(true);
            setTimeout(() => {
                setCopied(false);
            }, 1000)
        });
    };

    const getModelWeightFromAr = async () => {
        setModelWeightList([ipfsKey])
    }

    useEffect(() => {
        getModelWeightFromAr()
    }, [])

    return (
        <div className="flex flex-col items-center ">
            <div className="pb-4">
                <span>Preview</span>
                {imgSrc ? <img src={imgSrc} /> : null}
            </div>
            <div>
                {
                    proofToJSON
                        ? <div className='flex flex-col space-y-3 items-center'>
                            <div className='flex flex-row w-[350px] space-x-2 p-4 border-2 border-solid shadow-[0_3px_10px_rgb(0,0,0,0.2)] card'>
                                <span className='text-white font-mono'>{formatString(JSON.stringify(proofToJSON), 12)}</span>
                                <label className='swap items-center'>
                                    <input type='checkbox' checked={isCopied} />
                                    <svg className="swap-on w-6 h-6" onClick={() => {
                                        handleCopyProof();
                                        handleCopyClick();
                                    }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="green">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                    <svg className="swap-off w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                                    </svg>
                                </label>
                            </div>
                            <div className="btn" onClick={onClose} >OK</div>
                        </div>
                        : <>
                            {
                                isLoading
                                    ? <div className='flex flex-col items-center space-y-3'>
                                        <span className='font-mono'>{loadingText}</span>
                                        {loadingSecondaryText ? <span className='font-mono'>{loadingSecondaryText}</span> : null}
                                        <ProcessLoading />
                                    </div>
                                    : <div className='flex flex-col items-center space-y-3'>
                                        <select className="select select-bordered w-full max-w-xs" onChange={(e) => setModelWeightId(e.target.value)}>
                                            <option disabled selected>Select Model</option>
                                            {
                                                modelWeightList.map((modelWeight) => {
                                                    return <option value={modelWeight}>{modelWeight}</option>
                                                })
                                            }
                                        </select>
                                        <button className="btn" onClick={genProof} disabled={modelWeightId === null}>Generate</button>
                                    </div>
                            }
                        </>
                }
            </div>
            <canvas id="a" width="50" height="50" style={{ display: 'none' }} ></canvas>
        </div >
    );
}

export default GenerateProof;
