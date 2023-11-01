import React from 'react'
import {useDispatch,useSelector} from 'react-redux';
import {setSearchTerm} from '../features/searchSlice';


function Search(){
    const dispatch = useDispatch();
    const search = useSelector(state=>state.search)
    function handleChange(event){
        dispatch(setSearchTerm(event.target.value))
    }
    return (
        <div className='ui search'>
            <div className='ui icon input'>
                <input className='prompt' value={search} onChange={handleChange}/>
                <i className='search icon'/>
            </div>
        </div>
    )
}

export default Search;