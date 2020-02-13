import React from 'react';
import configs from './styleConfigs'

export default class Branches extends React.Component {
    constructor(props){
        super(props);
    }

    renderOwnConnex(){
        const { finalIdxs } = this.props;
        const finalChild = finalIdxs[finalIdxs.length - 1];

        return (
            <>
                 <div 
                    style={{
                        position: 'absolute',
                        bottom: '50%',
                        borderLeft: '1px solid black',
                        borderBottom: '1px solid black',
                        width: configs.INDENT - configs.ICON_SIZE/2,
                        left: configs.INDENT * (this.props.depth-2) + configs.LEFT_MARGIN + configs.ICON_SIZE/2,
                        height: '50%'
                    }}
                />
                { !finalChild && (
                    <div 
                        style={{
                            position: 'absolute',
                            bottom: '0%',
                            borderLeft: '1px solid black',
                            width: configs.INDENT - configs.ICON_SIZE/2,
                            left: configs.INDENT * (this.props.depth-2) + configs.LEFT_MARGIN + configs.ICON_SIZE/2,
                            height: '50%'
                        }}
                    />
                )}
            </>
        )
    }

    renderPrevConnex(){
        return this.props.finalIdxs.slice(0,-1).map((final,i) => {
            if (final) return null;
            return (
                <div style={{
                    height: '100%', 
                    width: 5,
                    position: 'absolute',
                    borderLeft: '1px solid black',
                    top: 0,
                    left: configs.LEFT_MARGIN + configs.ICON_SIZE/2 + configs.INDENT * i,
                }}/>
            )
        })
    }

    render(){
        return (
            <>
                { this.renderOwnConnex() }   
                { this.renderPrevConnex() } 
            </>
        )
    }
}