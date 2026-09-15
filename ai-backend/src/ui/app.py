import streamlit as st
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from src.agents.graph import create_research_graph
from src.agents.state import ResearchState
import src.agents.graph
from langchain_core.messages import AIMessage

# Mock LLM removed - connecting to real API

st.set_page_config(page_title="Lexora AI Intake", page_icon="⚖️", layout="wide")
st.sidebar.success("⚡️ Live AI Mode: Connected to Gemini 3.6 Flash.")

st.title("⚖️ Lexora AI - Junior Lawyer Intake")
st.markdown("Chat with the Junior Lawyer to provide the facts of your case.")

# Initialize chat history
if "messages" not in st.session_state:
    st.session_state.messages = []

# Display chat messages from history on app rerun
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# React to user input
if prompt := st.chat_input("Describe your legal scenario..."):
    # Display user message in chat message container
    st.chat_message("user").markdown(prompt)
    # Add user message to chat history
    st.session_state.messages.append({"role": "user", "content": prompt})
    
    app = create_research_graph()
    
    initial_state: ResearchState = {
        "messages": st.session_state.messages,
        "is_fact_gathering_complete": False,
        "missing_information": "",
        "extracted_issues": [],
        "retrieved_statutes": [],
        "retrieved_precedents": [],
        "analysis": "",
        "counterarguments": ""
    }
    
    with st.status("Analyzing Case Facts...", expanded=True) as status:
        try:
            final_state = app.invoke(initial_state)
            
            if not final_state.get("is_fact_gathering_complete"):
                status.update(label="More facts needed", state="complete", expanded=False)
                junior_question = final_state.get("missing_information", "Could you provide more details?")
                st.session_state.messages.append({"role": "assistant", "content": junior_question})
                st.chat_message("assistant").markdown(junior_question)
            else:
                status.update(label="Fact gathering complete! Generating Analysis & Counterarguments...", state="complete", expanded=False)
                
                analysis = final_state.get("analysis", "")
                counterarguments = final_state.get("counterarguments", "")
                
                full_response = f"**Senior Advocate Analysis:**\n\n{analysis}\n\n---\n\n**Adversarial Counsel (Weaknesses):**\n\n{counterarguments}"
                
                st.session_state.messages.append({"role": "assistant", "content": full_response})
                
                with st.chat_message("assistant"):
                    st.markdown("### Senior Advocate Analysis")
                    st.markdown(analysis)
                    st.warning("### 🛡️ Adversarial Counsel (Weaknesses)\n" + counterarguments)
                
        except Exception as e:
            status.update(label="Error Occurred", state="error")
            st.error(f"Pipeline error: {e}")
